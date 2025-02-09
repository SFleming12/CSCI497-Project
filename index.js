// Load environment variables from a .env file into process.env
require('dotenv/config');

// Import the Discord client constructor from discord.js
const { Client } = require('discord.js');

// Import the OpenAI client constructor from the openai package
const { OpenAI } = require('openai');

// Create a new Discord client instance with specific intents.
// Intents define which events the bot will receive.
const client = new Client({
    intents: ['Guilds', 'GuildMembers', 'GuildMessages', 'MessageContent']
});

// When the client is ready (logged in and connected), log a message to the console.
client.on('ready', () => {
    console.log('The bot is online');
});

// Define a prefix to ignore. Messages starting with this will be skipped.
const IGNORE_PREFIX = "!";

// Define an array of allowed channel IDs where the bot will operate.
// Only messages from these channels (or messages mentioning the bot) will be processed.
const CHANNELS = ['1337515858532110396']

// Initialize the OpenAI client using the API key from environment variables.
const openai = new OpenAI({
    apiKey: process.env.OpenAI_Key,
})

// Listen for new messages created in any channel the bot has access to.
client.on('messageCreate', async (message) => {
    // Ignore messages sent by bots to prevent loops and unintended responses.
    if (message.author.bot) return;
    
    // Ignore messages that start with the IGNORE_PREFIX.
    if (message.content.startsWith(IGNORE_PREFIX)) return;
    
    // Only process messages if they are in an allowed channel or the bot is mentioned.
    if (!CHANNELS.includes(message.channelId) && !message.mentions.users.has(client.user.id)) return;

    // Start the typing indicator to show that the bot is processing a response.
    await message.channel.sendTyping();

    // Set up an interval to keep the typing indicator active every 5 seconds.
    // This is useful if generating a response takes a while.
    const sendTypingInterval = setInterval(() => {
        message.channel.sendTyping();
    }, 5000);

    // Create a conversation array to set the context for the chatbot.
    // Here we instruct the chatbot (via the system role) to "be a condescending chatbot."
    // Note: Although we build this conversation array, the actual API call below builds its own messages array.
    let conversation = [];
    conversation.push({
        role: 'system',
        content: 'Be a condescending chatbot.'
    });

    // Fetch the last 10 messages from the channel to potentially use as conversation context.
    // The messages are fetched in reverse chronological order (newest first).
    let prevMessages = await message.channel.messages.fetch({ limit: 10 });
    // Reverse the messages so they are in chronological order (oldest first).
    prevMessages.reverse();

    // Process the previous messages. This loop currently filters out:
    // - Messages sent by bots (unless it's from this bot itself)
    // - Messages starting with the ignore prefix.
    // Currently, the filtered messages are not added to the conversation context.
    prevMessages.forEach((msg) => {
        if (msg.author.bot && msg.author.id !== client.user.id) return;
        if (msg.content.startsWith(IGNORE_PREFIX)) return;
        // You might consider adding these messages to the conversation array for more context.
    });

    // Call OpenAI's chat completion API to generate a response.
    // We specify the model (gpt-3.5-turbo) and provide a list of messages:
    // - A system message to set the behavior of the chatbot.
    // - The user's message as the conversation starter.
    const response = await openai.chat.completions
        .create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'Be a condescending chatbot.'
                },
                {
                    role: 'user',
                    content: message.content,
                }
            ]
        })
        .catch((error) => console.error('OpenAI Error:\n', error));
    
    // Once a response is received (or an error occurs), clear the typing indicator interval.
    clearInterval(sendTypingInterval);

    // If no response was received from OpenAI, inform the user and exit.
    if (!response) {
        message.reply("I'm tired please try again later");
        return;
    }
    
    // Reply to the user's message with the generated response from OpenAI.
    // The response content is extracted from the first choice provided.
    message.reply(response.choices[0].message.content);
});

// Log the bot into Discord using the token from the environment variables.
client.login(process.env.TOKEN);
