import { ElevenLabsClient } from "elevenlabs";

export const ELEVEN_LABS_VOICE_ID = '56HLnwpUyG7nn6JRX5Rp'; // Two Coats
// export const ELEVEN_LABS_VOICE_ID = 'sSsyHEdRk7EscVCLIh9D'; // Gangplank
// export const ELEVEN_LABS_VOICE_ID = '8JhIkHF8UtIO3bitdE1F'; // Aatrox

export const elevenLabsClient = new ElevenLabsClient({
    apiKey: process.env.ELEVEN_LABS_API_KEY,
});

