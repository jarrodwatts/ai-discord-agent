import 'dotenv/config';
import OpenAI from "openai";
import { createAssistant } from './openai/createAssistant.js';
import { createThread } from './openai/createThread.js';
import { discordClient } from './discord/discordClient.js';
import { VoiceChannel } from 'discord.js';
import { VoiceHandler } from './discord/VoiceHandler.js';
import { getDiscordGuild, channelId } from './const/discordDetails.js';

async function main(): Promise<void> {
    const openaiClient = new OpenAI();

    try {
        console.log('🚀 Starting bot initialization...');

        console.log('🤖 Creating OpenAI assistant...');
        const assistant = await createAssistant(openaiClient);
        console.log(`✅ Assistant created with ID: ${assistant.id}`);

        console.log('🧵 Creating initial thread...');
        const thread = await createThread(openaiClient);
        console.log(`✅ Thread created with ID: ${thread.id}`);


        console.log('🔑 Logging into Discord...');
        await discordClient.login(process.env.DISCORD_API_TOKEN);

        console.log('🔑 Getting Discord guild...');
        const discordGuild = await getDiscordGuild();
        console.log('✅ Discord guild fetched');

        console.log(`🔑 Getting voice channel: ${channelId}`);
        const voiceChannel = discordGuild.channels.cache.get(channelId) as VoiceChannel;
        console.log(`✅ Voice channel fetched: ${voiceChannel.name}`);

        // Initialize voice handler
        const voiceHandler = new VoiceHandler(openaiClient, discordClient, thread, assistant, discordGuild, voiceChannel);
        console.log('🔊 Initializing voice handler...');

        // Immediately join voice channel
        await voiceHandler.joinChannel(voiceChannel);
        console.log('✅ Voice handler initialized and joined voice channel!');

    } catch (error) {
        console.error('❌ Error in main:', error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
    }
}

main().catch((error) => {
    console.error('💥 Unhandled error:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
});
