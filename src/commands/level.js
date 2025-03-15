const { SlashCommandBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');

const db = new QuickDB();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('level')
        .setDescription("Check your current level."),
    run: async ({ interaction }) => {
        const userId = interaction.user?.id || interaction.member?.user?.id;
        if (!userId) {
            return interaction.reply("I couldn't determine your user ID. Please try again.");
        }

        let level = await db.get(`level_${userId}`) || 1; // Default level is 1 if not found
        
        await interaction.reply(`<@${userId}>, you are currently at level ${level}!`);
    },
};
