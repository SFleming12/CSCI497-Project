require("dotenv/config");
const { Client, GatewayIntentBits } = require("discord.js");
const { CommandKit } = require("commandkit");
const { OpenAI } = require("openai");

// Initialize Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Initialize OpenAI API
const openai = new OpenAI({
  apiKey: process.env.OpenAI_Key,
});

// Store user-selected personalities
const userPersonalities = new Map();

// Load CommandKit (automatically picks up commands/select-personality.js)
new CommandKit({
  client,
  commandsPath: `${__dirname}/commands`,
  eventsPath: `${__dirname}/events`,
  bulkRegister: true,
});

// Log when the bot is online
client.on("ready", () => {
  console.log(`${client.user.tag} is online.`);
});

// Handle chatbot responses with conversation history
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const IGNORE_PREFIX = "!";
  if (message.content.startsWith(IGNORE_PREFIX)) return;

  // Default chatbot personality
  let personality = "Be a helpful chatbot.";

  // Check if user has selected a personality
  const selectedPersonality = userPersonalities.get(message.author.id);
  if (selectedPersonality) {
    const personalities = {
      // Positive
      nice: "Be a friendly and positive chatbot.",
      kind: "Be a compassionate, caring, and always willing-to-help chatbot.",
      witty: "Be a chatbot who is quick with clever jokes and sharp humor.",
      charismatic: "Be a chatbot who is naturally charming and attracts people with energy.",
      optimistic: "Be a chatbot who sees the bright side of things and spreads positivity.",
      // Neutral
      sarcastic: "Be a chatbot who uses irony and dry humor, sometimes playful, sometimes biting.",
      reserved: "Be a chatbot who is quiet and introspective, keeping thoughts to yourself.",
      blunt: "Be a chatbot who speaks your mind directly, without sugarcoating.",
      stoic: "Be a chatbot who remains calm and unemotional, unaffected by external events.",
      // Negative
      arrogant: "Be a chatbot who is overconfident and believes you are superior to others.",
      pessimistic: "Be a chatbot who always expects the worst and sees the negative in everything.",
      manipulative: "Be a chatbot who uses others for your own gain through deception.",
      impulsive: "Be a chatbot who acts without thinking, often leading to reckless decisions.",
      // Misc
      funny: "Be a humorous and entertaining chatbot.",
    };
    personality = personalities[selectedPersonality] || personality;
  }

  // Typing indicator
  await message.channel.sendTyping();
  const sendTypingInterval = setInterval(() => message.channel.sendTyping(), 5000);

  try {
    // Fetch last 10 messages for context
    let prevMessages = await message.channel.messages.fetch({ limit: 10 });
    prevMessages = Array.from(prevMessages.values()).reverse(); // Oldest first

    let conversation = [{ role: "system", content: personality }];

    prevMessages.forEach((msg) => {
      if (msg.author.bot && msg.author.id !== client.user.id) return;
      if (msg.content.startsWith(IGNORE_PREFIX)) return;
      
      conversation.push({
        role: msg.author.id === client.user.id ? "assistant" : "user",
        content: msg.content,
      });
    });

    conversation.push({ role: "user", content: message.content });

    // OpenAI API call
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: conversation,
    });

    clearInterval(sendTypingInterval);
    message.reply(response.choices[0].message.content);
  } catch (error) {
    console.error("OpenAI Error:", error);
    clearInterval(sendTypingInterval);
    message.reply("Oops! Something went wrong.");
  }
});

// Handle personality selection updates
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isStringSelectMenu()) return;

  if (interaction.customId.startsWith("select-personality")) {
    const selectedPersonality = interaction.values[0];
    userPersonalities.set(interaction.user.id, selectedPersonality);

    await interaction.update({
      content: `You have selected: **${selectedPersonality}**`,
      components: [],
    });
  }
});

// Login the bot
client.login(process.env.TOKEN);
