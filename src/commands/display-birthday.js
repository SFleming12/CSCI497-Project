// Display the set birthday

const { SlashCommandBuilder } = require("discord.js");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("display-birthday")
    .setDescription("Display your set birthday date"),
  async run({ interaction }) {
    const birthdayChannel = interaction.guild.channels.cache.get(
      process.env.BIRTHDAY_CHANNEL_ID
    );

    // If there is no set birthday channel, let the user know
    if (!birthdayChannel) {
      return interaction.reply({
        content: "There is no birthday data channel set.",
        ephemeral: true,
      });
    }

    // Fetch the birthday set date and display it to the user
    const messages = await birthdayChannel.messages.fetch({ limit: 100 });
    const userMessage = messages.find((msg) =>
      msg.content.startsWith(interaction.user.id)
    );

    if (userMessage) {
      const birthdayDate = userMessage.content.split(" - ")[1];
      await interaction.reply({
        content: `Your birthday has been set to **${birthdayDate}**.`,
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "No birthday set date found.",
        ephemeral: true,
      });
    }
  },
};
