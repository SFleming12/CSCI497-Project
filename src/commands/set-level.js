const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { QuickDB } = require('quick.db');

const db = new QuickDB();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-level')
        .setDescription("Sets a user's level to a specified value (Admin only).")
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user whose level will be changed')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('level')
                .setDescription('The new level to set')
                .setRequired(true)
        ),
    run: async ({ interaction }) => {
        // Check if user has admin permissions
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
        }

        const targetUser = interaction.options.getUser('user');
        const newLevel = interaction.options.getInteger('level');

        // Make sure level is not being set to a value below 1
        if (newLevel < 1) {
            return interaction.reply({ content: "Level must be 1 or higher.", ephemeral: true });
        }

        await db.set(`level_${targetUser.id}`, newLevel); //Reset level
        await db.set(`xp_${targetUser.id}`, 0); // Reset XP 

        // Reply to user confirming their level
        await interaction.reply({ content: `Successfully set <@${targetUser.id}>'s level to ${newLevel} and reset their XP.`, ephemeral: false });
    },
};
