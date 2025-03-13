const { SlashCommandBuilder } = require("discord.js");
const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OpenAI_Key,
});

module.exports = {
  data: new SlashCommandBuilder()
    .setName("roast")
    .setDescription("Generates a witty roast for a user")
    .addUserOption(option =>
      option
        .setName("target")
        .setDescription("The user to roast")
        .setRequired(true)
    ),

  async run(context) {
    // Extract the raw Discord interaction from the context.
    const discordInteraction = context.interaction || context;

    if (
      !discordInteraction.options ||
      typeof discordInteraction.options.getUser !== "function"
    ) {
      console.error("Interaction options are not available.");
      // If we cannot access options, return an error string.
      return "Something went wrong: command options are not available.";
    }

    // Get the target user.
    const targetUser = discordInteraction.options.getUser("target");
    if (!targetUser) {
      // If for some reason target is missing, reply directly.
      if (typeof discordInteraction.reply === "function") {
        await discordInteraction.reply("I need someone to roast!");
      }
      return;
    }

    // Check if the user has selected the "witty" personality
    const selectedPersonality = userPersonalities.get(discordInteraction.user.id);
    if (selectedPersonality !== "witty") {
      await discordInteraction.reply("You must select the witty personality to use this command.");
      return;
    }

    // Defer reply if possible.
    if (typeof discordInteraction.deferReply === "function") {
      await discordInteraction.deferReply();
    } else {
      console.warn("deferReply() is not available on the interaction.");
    }

    // Build the roast prompt.
    const roastPrompt = `Generate a funny, lighthearted roast for the Discord user named ${targetUser.username}. Keep it witty but not offensive.`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "system", content: roastPrompt }],
      });
      const roast = response.choices[0].message.content;

      if (typeof discordInteraction.editReply === "function") {
        await discordInteraction.editReply(`🔥 **${targetUser.username}**, ${roast}`);
      } else {
        console.warn("editReply() is not available; returning response string instead.");
        return `🔥 **${targetUser.username}**, ${roast}`;
      }
    } catch (error) {
      console.error("OpenAI Error:", error);
      if (typeof discordInteraction.editReply === "function") {
        await discordInteraction.editReply("Oops! I failed to deliver the burn.");
      } else {
        return "Oops! I failed to deliver the burn.";
      }
    }
  },
};
