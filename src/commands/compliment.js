// A command for the optimistic personality that generates compliments
// Ability for the command to be triggered

// Send the request to openai to receive a compliment
const { SlashCommandBuilder } = require("discord.js");
const { OpenAI } = require("openai");

const openai = new OpenAI({
  // Ensure you have an OPENAI key in your .env file
  apiKey: process.env.OPENAI_KEY,
});

module.exports = {
  data: new SlashCommandBuilder()
    .setName("compliment")
    .setDescription("Give a compliment to the user"),

  async run({ interaction }) {
    // Prompt OpenAI to generate a compliment
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "Generate a random compliment to make someone feel good about themselves.",
          },
          {
            role: "user",
            content: `Give a compliment to ${interaction.user.username}`,
          },
        ],
      });

      // Extract the response text
      const compliment = response.choices[0].message.content;

      // Reply to the user with the generated compliment
      await interaction.reply(`${interaction.user}, ${compliment}`);
    } catch (error) {
      console.error("Error generating compliment with OpenAI:", error);
      await interaction.reply(
        "Oops, something went wrong while generating your compliment. Please try again later."
      );
    }
  },
};
