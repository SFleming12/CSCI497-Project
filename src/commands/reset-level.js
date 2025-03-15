const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { QuickDB } = require('quick.db');

const db = new QuickDB();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resetlevel')
        .setDescription("Resets a user's level and XP to 1 (Admin only).")
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user whose level will be reset')
                .setRequired(true)
        ),
    run: async ({ interaction }) => {
        // Check if the user has admin permissions
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
        }

        // Get the user whose level will be reset
        const targetUser = interaction.options.getUser('user');

        // Reset level and XP for the specified user
        await db.set(`level_${targetUser.id}`, 1); // Reset level to 1
        await db.set(`xp_${targetUser.id}`, 0); // Reset XP to 0

        await interaction.reply({ content: `Successfully reset <@${targetUser.id}>'s level and XP.`, ephemeral: false });
    },
};
