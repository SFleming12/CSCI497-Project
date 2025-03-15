const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('obstacle')
        .setDescription('Share an obstacle you are facing, and receive a Stoic response on how to deal with it.')
        .addStringOption(option =>
            option.setName('obstacle')
                .setDescription('Describe the obstacle you are facing.')
                .setRequired(true)
        ),
    run: async ({ interaction }) => {
        const obstacle = interaction.options.getString('obstacle');

        // Generate a Stoic response
        const stoicResponse = generateStoicResponse(obstacle);

        // Reply with the Stoic guidance
        await interaction.reply(stoicResponse);
    },
};

// Function to generate a Stoic-inspired response
function generateStoicResponse(obstacle) {
    // Stoic principles for responding to challenges
    const stoicQuotes = [
        "What is within our power is our judgment, our actions, and our reactions. Focus on what you can control, and let go of what you can't.",
        "The obstacle on your path is not an enemy but an opportunity for growth. Embrace it as a chance to cultivate strength and resilience.",
        "Remember, the mind that is disturbed by external events is the mind that has not yet mastered itself. Keep your peace within, regardless of the obstacle.",
        "It is not the events themselves that disturb us, but our judgments about them. Reframe your thinking to focus on solutions, not problems.",
        "Just as a stone is polished by friction, a soul is strengthened by adversity. Do not shy away from challenges, but use them to improve."
    ];

    // Select a random Stoic quote as a response
    const randomResponse = stoicQuotes[Math.floor(Math.random() * stoicQuotes.length)];

    return `You mentioned the obstacle: *"${obstacle}"*. Here's a Stoic response for you:\n\n"${randomResponse}"`;
}
