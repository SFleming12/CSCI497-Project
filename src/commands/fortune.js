const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("fortune")
    .setDescription("Receive a randomly generated fortune"),

  async run(context) {
    // Extract the raw Discord interaction from the context.
    const discordInteraction = context.interaction || context;

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

    // Predefined list of witty fortunes
    const fortunes = [
      "You will have a great day... unless you step on a Lego.",
      "Happiness is coming your way! Just not today.",
      "A surprise awaits you. Hopefully, it's not your internet bill.",
      "Your future looks bright. But so does your screen. Go outside.",
      "Someone is thinking of you. It's probably your mom.",
      "You will soon discover a hidden talent... for procrastination.",
      "Adventure is on the horizon. But so is your couch. Tough choice.",
      "You will receive good news soon. Or at least fewer emails.",
      "The universe has big plans for you... once you get out of bed.",
      "Success is in your future! Unless you keep hitting snooze.",
      "You will soon find what you are looking for. Probably in the last place you check.",
      "An exciting opportunity is coming your way. Swipe right.",
      "You will gain a new perspective on life. Or just new glasses.",
      "Your patience will be tested soon. Probably by slow WiFi.",
      "Something unexpected will happen today. Like you actually reading this fortune.",
      "A wise person once said: 'Always believe in yourself.' But they also believed in Bigfoot.",
      "You are destined for greatness. Or at least decent coffee.",
      "A small act of kindness will bring you joy. Like sharing this bot with a friend.",
      "You will meet someone interesting soon. Unless you avoid people. Then nevermind.",
      "Your creativity will flourish today! Use it wisely... or just doodle in a notebook.",
    ];

    // Randomly select a fortune
    const randomFortune = fortunes[Math.floor(Math.random() * fortunes.length)];

    if (typeof discordInteraction.editReply === "function") {
      await discordInteraction.editReply(`🔮 **Your Fortune:** ${randomFortune}`);
    } else {
      console.warn("editReply() is not available; returning response string instead.");
      return `🔮 **Your Fortune:** ${randomFortune}`;
    }
  },
};
