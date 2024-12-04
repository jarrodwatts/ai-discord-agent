import { discordClient } from "../discord/discordClient.js";

export const channelId = "1313372332403724379";
export const guildId = "1313372326347411456"

export async function getDiscordGuild() {
    try {
        return await discordClient.guilds.fetch(guildId);
    } catch (error) {
        console.error('❌ Error fetching Discord guild:', error instanceof Error ? error.message : 'Unknown error');
        throw error;
    }
}