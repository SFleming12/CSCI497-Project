// features/pomodoro.js
const { userPersonalities } = require('./chatgpt');

async function handlePomodoroCommands(message) {
  const lower = message.content.trim().toLowerCase();
  if (!lower.startsWith('pomodoro')) {
    return false;
  }

  // personality must be "study"
  const personality = userPersonalities.get(message.author.id) || "study";
  if (personality !== "study") {
    await message.reply("You must have the **study** personality to use the Pomodoro command!");
    return true;
  }

  // parse minutes
  const parts = message.content.split(/\s+/);
  let minutes = 25;
  if (parts.length > 1) {
    const parsed = parseInt(parts[1], 10);
    if (!isNaN(parsed) && parsed > 0) {
      minutes = parsed;
    }
  }

  await message.reply(`Pomodoro timer started for ${minutes} minute${minutes === 1 ? '' : 's'}! I'll remind you when it's over.`);
  setTimeout(() => {
    message.channel.send(`${message.author}, your Pomodoro session is over! Time for a break.`);
  }, minutes * 60 * 1000);

  return true;
}

module.exports = {
  handlePomodoroCommands
};
