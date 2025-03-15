const { SlashCommandBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');

const db = new QuickDB();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    run: async ({ interaction, client }) => {
        const userId = interaction.user?.id || interaction.member?.user?.id;
        if (!userId) {
            return interaction.reply({ content: "I couldn't determine your user ID.", ephemeral: true });
        }

        let level = await db.get(`level_${userId}`) || 1; // Default level is 1 if not found

		//Confirm the user meets level requirements
        if (level < 3) {
            return interaction.reply({ content: "You must be level 3 or higher to use this command!", ephemeral: true });
        }

        await interaction.reply(`:ping_pong: Pong! ${client.ws.ping}ms`);
    },
};
