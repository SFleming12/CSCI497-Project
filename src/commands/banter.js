const { SlashCommandBuilder } = require("discord.js");
const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OpenAI_Key,
});

module.exports = {
  data: new SlashCommandBuilder()
    .setName("bants")
    .setDescription("Playfully roast yourself or someone else based on a message.")
    .addStringOption(option =>
      option
        .setName("message")
        .setDescription("The message to roast, could be about anything!")
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

    // Get the message the user wants to roast.
    const userMessage = discordInteraction.options.getString("message");
    if (!userMessage) {
      if (typeof discordInteraction.reply === "function") {
        await discordInteraction.reply("Please provide a message to roast!");
      }
      return;
    }

    // Get the user who invoked the command
    const targetUser = discordInteraction.user;

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

    // Build the bants prompt with the targetUser's username included.
    const bantsPrompt = `Generate a witty, playful roast based on the following message by ${targetUser.username}: "${userMessage}". Keep it fun, lighthearted, and clever but not offensive. This roast should be something that could be said in a friendly banter between friends.`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "system", content: bantsPrompt }],
      });
      const bants = response.choices[0].message.content;

      if (typeof discordInteraction.editReply === "function") {
        await discordInteraction.editReply(`🔥${bants}`);
      } else {
        console.warn("editReply() is not available; returning response string instead.");
        return `🔥 **Bants by ${targetUser.username}**: ${bants}`;
      }
    } catch (error) {
      console.error("OpenAI Error:", error);
      if (typeof discordInteraction.editReply === "function") {
        await discordInteraction.editReply("Oops! I failed to deliver the bants.");
      } else {
        return "Oops! I failed to deliver the bants.";
      }
    }
  },
};
