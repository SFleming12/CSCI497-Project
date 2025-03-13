const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("8ball")
    .setDescription("Ask the magic 8-ball a question")
    .addStringOption(option =>
      option
        .setName("question")
        .setDescription("Ask your question to the magic 8-ball")
        .setRequired(true)
    ),

  async run(context) {
    // Extract the raw Discord interaction from the context.
    const discordInteraction = context.interaction || context;

    if (
      !discordInteraction.options ||
      typeof discordInteraction.options.getString !== "function"
    ) {
      console.error("Interaction options are not available.");
      return "Something went wrong: command options are not available.";
    }

    // Get the question from the user
    const question = discordInteraction.options.getString("question");
    if (!question) {
      if (typeof discordInteraction.reply === "function") {
        await discordInteraction.reply("Please ask a question!");
      }
      return;
    }

    // Check if the user has selected the "witty" personality
    const selectedPersonality = userPersonalities.get(discordInteraction.user.id);
    if (selectedPersonality !== "witty") {
      await discordInteraction.reply("You must select the witty personality to use this command.");
      return;
    }

    if (typeof discordInteraction.deferReply === "function") {
      await discordInteraction.deferReply();
    } else {
      console.warn("deferReply() is not available on the interaction.");
    }

    // Predefined list of 8-ball responses
    const responses = [
      "It is certain",
      "It is decidedly so",
      "Without a doubt",
      "Yes, definitely",
      "You may rely on it",
      "As I see it, yes",
      "Most likely",
      "Outlook good",
      "Yes",
      "Signs point to yes",
      "Reply hazy, try again",
      "Ask again later",
      "Better not tell you now",
      "Cannot predict now",
      "Concentrate and ask again",
      "Don't count on it",
      "My reply is no",
      "My sources say no",
      "Outlook not so good",
      "Very doubtful",
    ];

    // Randomly select a response
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    if (typeof discordInteraction.editReply === "function") {
      await discordInteraction.editReply(`🎱 **Magic 8-ball says:** ${randomResponse}`);
    } else {
      console.warn("editReply() is not available; returning response string instead.");
      return `🎱 **Magic 8-ball says:** ${randomResponse}`;
    }
  },
};
