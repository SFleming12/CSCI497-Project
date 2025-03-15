// Edit the set birthday

const { SlashCommandBuilder } = require("discord.js");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("edit-birthday")
    .setDescription("Edit your set birthday date"),

  async run({ interaction }) {
    await interaction.reply({
      content: "Enter your new birthday in MM-DD format", // Ask the user the new birthday
      ephemeral: true,
    });

    // Create a filter to only allow the user's message
    const filter = (message) => message.author.id === interaction.user.id;

    // Wait for the user to respond with a message
    const collected = await interaction.channel.awaitMessages({
      filter,
      time: 60000, // Wait for 1 minute
      max: 1, // Only accept one response
    });

    if (collected.size === 0) {
      return interaction.followUp("Time's up! Please try again.");
    }

    const newBirthday = collected.first().content;
    const birthdayRegex = /^\d{2}-\d{2}$/;

    if (!birthdayRegex.test(newBirthday)) {
      return interaction.followUp("Invalid format! Please use `MM-DD` format.");
    }

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
    // Fetch the old set birthday date
    const messages = await birthdayChannel.messages.fetch({ limit: 100 });
    const userMessage = messages.find((msg) =>
      msg.content.startsWith(interaction.user.id)
    );

    // Delete the old set birthday date
    if (userMessage) {
      await userMessage.delete();
    }

    // Set the birthday date to the new date
    await birthdayChannel.send(`${interaction.user.id} - ${newBirthday}`);

    await interaction.followUp(
      `Your birthday has been updated to **${newBirthday}**.`
    );
  },
};
