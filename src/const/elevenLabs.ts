import { ElevenLabsClient } from "elevenlabs";

export const ELEVEN_LABS_VOICE_ID = process.env.ELEVEN_LABS_VOICE_ID;

export const elevenLabsClient = new ElevenLabsClient({
    apiKey: process.env.ELEVEN_LABS_API_KEY,
});

