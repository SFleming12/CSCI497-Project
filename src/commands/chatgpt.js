// features/chatgpt.js

const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });

// userId -> personality (e.g. "study", "witty", "nice", etc.)
const userPersonalities = new Map();

function getSystemPrompt(personality) {
  switch (personality) {
    case "study":
      return "You are a friendly and helpful study partner chatbot. Offer thorough explanations and guidance.";
    case "witty":
      return "You are a witty chatbot who loves clever jokes and humor.";
    case "nice":
      return "You are a warm, friendly chatbot who always responds gently and loves to encourage people."; 
    // ... any others you want, e.g. "kind"
    default:
      return "You are a friendly and helpful study partner chatbot.";
  }
}

// Minimal conversation + rate limit
const userConversations = new Map(); // userId -> last few messages
const gptLastUsage = new Map();      // userId -> last usage time

function isUserOnGPTCooldown(userId) {
  const lastUsed = gptLastUsage.get(userId) || 0;
  return (Date.now() - lastUsed) < 30000; // 30s
}

function updateConversationHistory(userId, userMessage) {
  let history = userConversations.get(userId) || [];
  history.push(userMessage);
  if (history.length > 3) {
    history = history.slice(-3);
  }
  userConversations.set(userId, history);
}

async function handleChatGpt(message) {
  if (isUserOnGPTCooldown(message.author.id)) {
    await message.reply("You're using GPT too quickly. Try again in a few seconds.");
    return;
  }
  gptLastUsage.set(message.author.id, Date.now());

  await message.channel.sendTyping();
  updateConversationHistory(message.author.id, message.content);
  const userHistory = userConversations.get(message.author.id) || [];

  const chosen = userPersonalities.get(message.author.id) || "study";
  const systemPrompt = getSystemPrompt(chosen);

  const conversation = [
    { role: 'system', content: systemPrompt },
    ...userHistory.map(msg => ({ role: 'user', content: msg }))
  ];

  let response;
  try {
    response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: conversation
    });
  } catch (error) {
    console.error("OpenAI Error:", error);
    await message.reply("I'm having trouble contacting GPT right now. Please try again later.");
    return;
  }

  if (!response || !response.choices || !response.choices.length) {
    await message.reply("I'm tired, please try again later.");
    return;
  }

  await message.reply(response.choices[0].message.content);
}

module.exports = {
  handleChatGpt,
  userPersonalities
};
