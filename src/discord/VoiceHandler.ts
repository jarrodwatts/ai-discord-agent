import {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    VoiceConnection,
    AudioPlayer,
    EndBehaviorType,
} from '@discordjs/voice';
import { Guild, VoiceChannel } from 'discord.js';
import { Readable } from 'stream';
import { unlinkSync, createWriteStream, createReadStream } from 'fs';
import OpenAI from 'openai';
import { Client } from 'discord.js';
import prism from 'prism-media';
import { Thread } from 'openai/resources/beta/threads/threads';
import { createRun } from '../openai/createRun.js';
import { performRun } from '../openai/performRun.js';
import { Assistant } from 'openai/resources/beta/assistants.mjs';
import { ElevenLabsClient } from "elevenlabs";
import { ELEVEN_LABS_VOICE_ID } from '../const/elevenLabs.js';

export class VoiceHandler {
    // Discord connection
    public discordClient: Client;
    public discordGuild: Guild;
    public voiceChannel: VoiceChannel;
    private connection: VoiceConnection | null = null;
    private player: AudioPlayer;

    // OpenAI connection
    private openaiClient: OpenAI;
    private thread: Thread;
    private assistant: Assistant;

    // State
    private isListening: boolean = false;

    constructor(openaiClient: OpenAI, discordClient: Client, thread: Thread, assistant: Assistant, discordGuild: Guild, voiceChannel: VoiceChannel) {
        console.log('🎮 Initializing VoiceHandler');
        this.player = createAudioPlayer();
        this.openaiClient = openaiClient;
        this.thread = thread;
        this.assistant = assistant;
        this.discordClient = discordClient;
        this.discordGuild = discordGuild;
        this.voiceChannel = voiceChannel;
    }

    async joinChannel(channel: VoiceChannel) {
        console.log(`🎙️ Attempting to join voice channel: ${channel.name}`);
        try {
            this.connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator,
                selfDeaf: false,
                selfMute: false
            });

            this.connection.on('stateChange', (oldState, newState) => {
                console.log(`🔄 Voice connection state changed: ${oldState.status} -> ${newState.status}`);
                if (newState.status === 'disconnected') {
                    this.connection?.destroy();
                    this.connection = null;
                }
            });

            this.connection.subscribe(this.player);
            await this.startListening();
            console.log('✅ Successfully joined and started listening');
            return true;
        } catch (error) {
            console.error('❌ Error joining voice channel:', error);
            throw error;
        }
    }

    private async startListening() {
        if (!this.connection) {
            console.warn('⚠️ Cannot start listening: No connection');
            return;
        }

        console.log('👂 Starting voice recognition');
        this.isListening = true;

        const receiver = this.connection.receiver;

        this.connection.receiver.speaking.on('start', async (userId) => {
            console.log(`🗣️ User ${userId} started speaking`);
            const audioStream = receiver.subscribe(userId, {
                end: {
                    behavior: EndBehaviorType.AfterSilence,
                    duration: 500,
                },
            });

            const fileName = `./temp-${userId}-${Date.now()}.mp3`;
            console.log(`💾 Creating temporary file: ${fileName}`);

            const decoder = new prism.opus.Decoder({ rate: 48000, channels: 2, frameSize: 960 });
            const mp3Converter = new prism.FFmpeg({
                args: [
                    '-f', 's16le',
                    '-ar', '48000',
                    '-ac', '2',
                    '-i', '-',
                    '-c:a', 'libmp3lame',
                    '-b:a', '128k',
                    '-f', 'mp3'
                ]
            });

            const writeStream = createWriteStream(fileName);
            audioStream
                .pipe(decoder)
                .pipe(mp3Converter)
                .pipe(writeStream);

            audioStream.on('end', async () => {
                console.log('🎤 User finished speaking, processing audio...');
                await new Promise(resolve => writeStream.on('finish', resolve));

                try {
                    console.log('🔄 Transcribing audio with Whisper...');
                    const transcription = await this.openaiClient.audio.transcriptions.create({
                        file: createReadStream(fileName),
                        model: 'whisper-1',
                    });

                    if (transcription.text) {
                        console.log(`📝 Transcribed text: "${transcription.text}"`);

                        console.log('💬 Adding message to thread...');
                        await this.openaiClient.beta.threads.messages.create(this.thread.id, {
                            role: "user",
                            content: `User ID: ${userId}\n${transcription.text}`
                        });

                        console.log('🤖 Creating assistant run...');
                        const run = await createRun(this.openaiClient, this.thread, this.assistant.id);
                        const result = await performRun(run, this.openaiClient, this.thread);

                        if (result?.type === 'text') {
                            console.log('🔊 Converting response to speech with ElevenLabs...');
                            const elevenLabsClient = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });

                            const speech = await elevenLabsClient.textToSpeech.convert(
                                ELEVEN_LABS_VOICE_ID,
                                {
                                    text: result.text.value,
                                    voice_settings: {
                                        similarity_boost: 1,
                                        stability: 0.5,
                                        style: 0.5,
                                        use_speaker_boost: true
                                    },
                                    enable_logging: true,
                                    model_id: 'eleven_multilingual_v2',
                                },
                            );

                            // Convert the response into a Node.js readable stream
                            const readableStream = Readable.from(speech);
                            const audioResource = createAudioResource(readableStream);
                            this.player.play(audioResource);

                        } else {
                            console.error('❌ Error: Speech conversion did not return a valid Readable stream');
                        }
                    }
                } catch (error) {
                    console.error('❌ Error processing audio:', error);
                } finally {
                    console.log(`🧹 Cleaning up temporary file: ${fileName}`);
                    try {
                        unlinkSync(fileName);
                    } catch (e) {
                        console.error('❌ Error deleting temporary file:', e);
                    }
                }
            });
        });
    }

    disconnect() {
        console.log('👋 Disconnecting from voice channel');
        this.isListening = false;
        if (this.connection) {
            this.connection.destroy();
            this.connection = null;
        }
    }
} 