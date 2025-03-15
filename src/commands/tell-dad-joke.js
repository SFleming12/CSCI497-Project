// Send the request to openai to tell a dad joke
const { SlashCommandBuilder } = require("discord.js");
const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY, // Make sure to set your OpenAI API key in the .env file
});

module.exports = {
  data: new SlashCommandBuilder()
    .setName("tell-dad-joke")
    .setDescription("Tell a dad joke to the user"),

  async run({ interaction }) {
    // Prompt OpenAI to generate a dad joke
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Generate a random dad joke.",
          },
          {
            role: "user",
            content: `Tell a dad joke to ${interaction.user.username}`,
          },
        ],
      });

      // Extract the response text
      const compliment = response.choices[0].message.content;

      // Reply to the user with the generated compliment
      await interaction.reply(`${interaction.user}, ${compliment}`);
    } catch (error) {
      console.error("Error generating a dad joke with OpenAI:", error);
      await interaction.reply(
        "Oops, something went wrong while generating your dad joke. Please try again later."
      );
    }
  },
};
