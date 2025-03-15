// Remove the set birthday
const { SlashCommandBuilder } = require("discord.js");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("remove-birthday")
    .setDescription("Remove your set birthday date"),

  async run({ interaction }) {
    const birthdayChannel = interaction.guild.channels.cache.get(
      process.env.BIRTHDAY_CHANNEL_ID
    );

    if (!birthdayChannel) {
      return interaction.reply({
        content: "There is no birthday data channel set.",
        ephemeral: true,
      });
    }

    // Check to see if birthday has already been set (using user id and data in birthday channel)
    const messages = await birthdayChannel.messages.fetch({ limit: 100 });
    const userMessage = messages.find((msg) =>
      msg.content.startsWith(interaction.user.id)
    );

    // Delete the old set birthday date
    if (userMessage) {
      await userMessage.delete();
      await interaction.reply({
        content: "Your set birthday date has been removed successfully.",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "No set birthday date found",
        ephemeral: true,
      });
    }
  },
};
