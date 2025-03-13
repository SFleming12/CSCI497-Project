require("dotenv/config");
const { Client, GatewayIntentBits, ClientUser } = require("discord.js");
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
global.userPersonalities = userPersonalities;

// Load CommandKit (automatically picks up commands/select-personality.js)
new CommandKit({
  client,
  commandsPath: `${__dirname}/commands`,
  eventsPath: `${__dirname}/events`,
  bulkRegister: true,
});

// Log when the bot is online
client.on("ready", async () => {
  console.log(`${client.user.tag} is online.`);
  

  try {
    const currentAvatarURL = client.user.displayAvatarURL({ format: "png", size: 1024 }).split("?")[0];
    
    if (!currentAvatarURL.includes("SageGradient.png")) {
      await client.user.setAvatar("SageGradient.png");
      console.log("Default avatar set.");
    }
  } catch (error) {
    console.error("Error setting default avatar:", error);
  }
});

// Handle chatbot responses with conversation history
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const IGNORE_PREFIX = "!";
  if (message.content.startsWith(IGNORE_PREFIX)) return;

  // Default chatbot personality
  let personality = "Be a helpful chatbot.";
  const selectedPersonality = userPersonalities.get(message.author.id);

  if (selectedPersonality) {
    const personalities = {
      nice: "Act like a friendly and positive chatbot.",
      kind: "Act like a compassionate, caring, and always willing-to-help chatbot.",
      witty: "Act like a chatbot who is quick with clever jokes and sharp humor.",
      charismatic: "Act like a chatbot who is naturally charming and attracts people with energy.",
      optimistic: "Act like a chatbot who sees the bright side of things and spreads positivity.",
      sarcastic: "Act like a chatbot who uses irony and dry humor, sometimes playful, sometimes biting.",
      reserved: "Act like a chatbot who is quiet and introspective, keeping thoughts to yourself.",
      blunt: "Act like a chatbot who speaks your mind directly, without sugarcoating.",
      stoic: "Act like a chatbot who remains calm and unemotional, unaffected by external events.",
      arrogant: "Act like a chatbot who is overconfident and believes you are superior to others.",
      funny: "Act like a humorous and entertaining chatbot.",
    };
    personality = personalities[selectedPersonality] || personality;

    let newAvatar = "";
    if (
      personality === personalities.nice ||
      personality === personalities.kind ||
      personality === personalities.witty ||
      personality === personalities.charismatic ||
      personality === personalities.optimistic ||
      personality === personalities.funny
    ) {
      newAvatar = "SagePositive.png";
    } else if (
      personality === personalities.sarcastic ||
      personality === personalities.reserved ||
      personality === personalities.blunt ||
      personality === personalities.stoic
    ) {
      newAvatar = "SageNeutral.png";
    } else if (personality === personalities.arrogant) {
      newAvatar = "SageNegative.png";
    }

    if (newAvatar) {
      try {
        const currentAvatarURL = client.user.displayAvatarURL({ format: "png", size: 1024 }).split("?")[0];

        if (!currentAvatarURL.includes(newAvatar)) {
          await client.user.setAvatar(newAvatar);
          console.log("Avatar updated successfully.");
        } else {
          console.log("Avatar is already correct. No update needed.");
        }
      } catch (error) {
        console.error("Error changing avatar:", error);
      }
    }
  }

  // Typing indicator
  await message.channel.sendTyping();
  const sendTypingInterval = setInterval(() => message.channel.sendTyping(), 5000);

  try {
    // Fetch last 10 messages for context
    let prevMessages = await message.channel.messages.fetch({ limit: 10 });
    prevMessages = Array.from(prevMessages.values()).reverse(); // Oldest first

    let conversation = [{ role: "system", content: personality }];
    console.log(personality);
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

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isStringSelectMenu()) return;

  // Existing handler for personality selection
  if (interaction.customId.startsWith("select-personality")) {
    const selectedPersonality = interaction.values[0];
    userPersonalities.set(interaction.user.id, selectedPersonality);

    await interaction.update({
      content: `You have selected: **${selectedPersonality}**`,
      components: [],
    });
  }

  // Help command interactions
  if (interaction.customId.startsWith("help-")) {
    const selectedPersonality = interaction.values[0];
    let helpText = "";
    switch (selectedPersonality) {
      case "witty":
        helpText = `**Witty Personality Commands:**
- \`/roast\`: Hear a clever roast of the user's name
- \`/8ball \`: Receive a 8ball answer
- \`/fortune \`: User receives a witty fortune
- \`/bants\`: Recieve a banter response to a message!`;
        break;
      default:
        helpText = "No help available for this personality.";
    }

    await interaction.update({
      content: helpText,
      components: [],
    });
  }
});

// Login the bot
client.login(process.env.TOKEN);
