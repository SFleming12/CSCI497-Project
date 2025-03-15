const { SlashCommandBuilder } = require('discord.js');
const { OpenAI } = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_KEY,
  });

module.exports = {
    data: new SlashCommandBuilder()
        .setName('philosophy')
        .setDescription("Generates a random philosophical quote."),
    run: async ({ interaction }) => {
        try {
            // Generate a philosophy quote using OpenAI API
            const response = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a philosopher who provides deep, thought-provoking quotes.',
                    },
                    {
                        role: 'user',
                        content: 'Give me a random philosophical quote.',
                    },
                ],
            });

            // Extract the quote from the response
            const quote = response.choices[0].message.content;

            // Send the quote back as a reply
            await interaction.reply(quote);
            
        } catch (error) {
            console.error(error);
            await interaction.reply("Sorry, I couldn't generate a quote at this time.");
        }
    },
};
