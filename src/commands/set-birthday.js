// Set the birthday date of a user

const { SlashCommandBuilder } = require("discord.js");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("set-birthday")
    .setDescription(
      "Set your birthday date to have an announcement sent in the server on that day"
    ),

  async run({ interaction }) {
    // Prompt the user to enter their birthday in MM-DD format
    await interaction.reply({
      content: "Please enter your birthday in MM-DD format",
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

    const birthdayInput = collected.first().content;

    // Validate the input format (MM-DD)
    const birthdayRegex = /^\d{2}-\d{2}$/;
    if (!birthdayRegex.test(birthdayInput)) {
      return interaction.followUp("Invalid format! Please use `MM-DD` format");
    }

    // Ensure you have the BIRTHDAY_CHANNEL_ID in your .env file
    const birthdayChannel = interaction.guild.channels.cache.get(
      process.env.BIRTHDAY_CHANNEL_ID
    );

    // Let the user know if the command did not work due to a BIRTHDAY_CHANNEL_ID not being set in the .env file
    if (!birthdayChannel) {
      return interaction.followUp(
        "There is no birthday channel set to store the data."
      );
    }

    // Save the user's birthday in the channel (in the format USER_ID - MM-DD) to allow it to be announced later
    await birthdayChannel.send(`${interaction.user.id} - ${birthdayInput}`);

    // Confirm the birthday has been set by letting the user know
    await interaction.followUp(
      `Your birthday has been set to **${birthdayInput}** and saved.`
    );
  },
};
