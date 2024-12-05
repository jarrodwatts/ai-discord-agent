# Discord AI Agent

An AI-powered Discord bot that you can speak to inside a Discord voice channel.

To see how this was made, check out my [video tutorial](https://www.youtube.com/watch?v=xjRqmy6p1-c).

## Features

- AI Assistant powered by [OpenAI's Assistant API](https://platform.openai.com/docs/assistants/overview) with custom personality
- Voice interactions with Discord powered by [Discord.js](https://discord.js.org/), [OpenAI's Whisper API](https://platform.openai.com/docs/guides/speech-recognition) and [ElevenLabs](https://elevenlabs.io/).
- Direct blockchain interactions through [Viem](https://viem.sh/)

## Getting Started

1. Important: Node.js version 22.x is required. Recommend using [nvm](https://github.com/nvm-sh/nvm) to install it.

```bash
nvm install 22
nvm use 22
```

2. [Clone](https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository) the repository:

```bash
git clone https://github.com/jarrodwatts/onchain-agent.git

cd onchain-agent
```

2. Install dependencies:

```bash
npm install
```

3. Create a [Discord bot](https://discord.com/developers/docs/getting-started) and get your application and the API token.

4. Sign up for OpenAI and get your API key.

5. For blockchain interactions, you'll need a wallet private key. Please DO NOT use a wallet with any real funds.

6. Sign up for ElevenLabs and get your API key and pick a voice ID.

7. Create the `.env` file and add your OpenAI API key and wallet private key:

```bash
# OpenAI
OPENAI_API_KEY=

# Wallet
PRIVATE_KEY=

# Discord
DISCORD_APPLICATION_ID=
DISCORD_API_TOKEN=

# Elevenlabs
ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_ID=

```

8. Run the agent:

```bash
npm start
```
