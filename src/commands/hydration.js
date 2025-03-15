// features/hydration.js

const {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    PermissionFlagsBits
  } = require('discord.js');
  const fs = require('fs');
  const path = require('path');
  const { userPersonalities } = require('./chatgpt'); // so we can check "study"
    
  // Storage
  let hydrationReminders = {};
  const HYDRATION_DATA_FILE = path.join(__dirname, '..', 'hydrationData.json');
  
  const RANDOM_HYDRATION_MESSAGES = [
    "Time to drink some water!",
    "Grab a sip and keep going!",
    "Stay hydrated, friend!",
    "Don’t forget to hydrate!",
    "Water break time!",
  ];
  
  // ------------------ Load/Save Logic ------------------
  
  function loadHydrationReminders() {
    if (!fs.existsSync(HYDRATION_DATA_FILE)) return;
    const fileContents = fs.readFileSync(HYDRATION_DATA_FILE, 'utf-8');
    if (!fileContents) return;
  
    try {
      const savedData = JSON.parse(fileContents);
      for (const userId in savedData) {
        hydrationReminders[userId] = {
          ...savedData[userId],
          timeouts: [],
          midnightTimeout: null
        };
      }
    } catch (err) {
      console.error("Failed to parse hydrationData.json:", err);
    }
  }
  
  function saveHydrationReminders() {
    const dataToSave = {};
    for (const userId in hydrationReminders) {
      const { startHour, endHour, intervalHours, isPaused, channelId, stats } = hydrationReminders[userId];
      dataToSave[userId] = { startHour, endHour, intervalHours, isPaused, channelId, stats };
    }
    fs.writeFileSync(HYDRATION_DATA_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
  }
  
  // ------------------ Scheduling Logic ------------------
  
  function cancelAllRemindersForUser(userId) {
    const data = hydrationReminders[userId];
    if (!data) return;
  
    if (data.timeouts) {
      data.timeouts.forEach(t => clearTimeout(t));
      data.timeouts = [];
    }
    if (data.midnightTimeout) {
      clearTimeout(data.midnightTimeout);
      data.midnightTimeout = null;
    }
  }
  
  /** 
   * Return the channel to send messages to (DM or a specific channel).
   */
  async function getReminderChannel(client, userId) {
    const data = hydrationReminders[userId];
    if (!data || !data.channelId) return null;
  
    if (data.channelId === 'dm') {
      const user = await client.users.fetch(userId).catch(() => null);
      return user ? user.createDM() : null;
    }
    return client.channels.fetch(data.channelId).catch(() => null);
  }
  
  async function scheduleHydrationRemindersForToday(client, userId) {
    const data = hydrationReminders[userId];
    if (!data) return;
  
    const channel = await getReminderChannel(client, userId);
    if (!channel) return;
  
    const now = new Date();
    let hour = data.startHour;
    const interval = data.intervalHours || 2;
  
    while (hour <= data.endHour) {
      const reminderTime = new Date();
      reminderTime.setHours(hour, 0, 0, 0);
  
      if (reminderTime > now) {
        const msUntilReminder = reminderTime - now;
        const timeoutId = setTimeout(() => {
          const userData = hydrationReminders[userId];
          if (userData && !userData.isPaused) {
            const randomMsg = RANDOM_HYDRATION_MESSAGES[
              Math.floor(Math.random() * RANDOM_HYDRATION_MESSAGES.length)
            ];
            channel.send(`<@${userId}> ${randomMsg} (Scheduled reminder)`);
          }
        }, msUntilReminder);
        data.timeouts.push(timeoutId);
      }
      hour += interval;
    }
  
    // Schedule midnight reset
    const nextMidnight = new Date();
    nextMidnight.setHours(24, 0, 0, 0);
    const msUntilMidnight = nextMidnight - now;
  
    data.midnightTimeout = setTimeout(() => {
      data.timeouts = [];
      scheduleHydrationRemindersForToday(client, userId);
    }, msUntilMidnight);
  }
  
  async function startHydrationReminders(client, userId, startHour, endHour, intervalHours, channelChoice) {
    if (!hydrationReminders[userId]) {
      hydrationReminders[userId] = {
        startHour,
        endHour,
        intervalHours,
        isPaused: false,
        channelId: channelChoice, // 'dm' or channel ID
        stats: { count: 0, streak: 0, lastHydrated: null },
        timeouts: [],
        midnightTimeout: null
      };
    } else {
      const data = hydrationReminders[userId];
      data.startHour = startHour;
      data.endHour = endHour;
      data.intervalHours = intervalHours;
      data.channelId = channelChoice;
      data.isPaused = false;
    }
  
    cancelAllRemindersForUser(userId);
    await scheduleHydrationRemindersForToday(client, userId);
    saveHydrationReminders();
  }
  
  async function rescheduleAllRemindersOnStartup(client) {
    for (const userId in hydrationReminders) {
      const data = hydrationReminders[userId];
      if (!data.isPaused && data.channelId) {
        await scheduleHydrationRemindersForToday(client, userId);
      }
    }
  }
  
  // ------------------ Setup on Bot Ready ------------------
  
  async function onBotReady(client) {
    loadHydrationReminders();
    await rescheduleAllRemindersOnStartup(client);
  }
  
  // ------------------ Slash Command Definition ------------------
  
  const data = new SlashCommandBuilder()
    .setName("hydrate")
    .setDescription("Manage your hydration reminders (study personality only)")
    .addSubcommand(sub =>
      sub
        .setName("start")
        .setDescription("Start hydration reminders from startHour to endHour")
        .addIntegerOption(o =>
          o.setName("start_hour")
           .setDescription("0-23 (when to begin reminders)")
           .setRequired(true)
        )
        .addIntegerOption(o =>
          o.setName("end_hour")
           .setDescription("0-23 (when to end reminders)")
           .setRequired(true)
        )
        .addIntegerOption(o =>
          o.setName("interval")
           .setDescription("Interval in hours (default 2)")
           .setRequired(false)
        )
        .addBooleanOption(o =>
          o.setName("dm")
           .setDescription("Send reminders in DMs? Defaults to false.")
           .setRequired(false)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName("stop")
        .setDescription("Stop and clear all your hydration reminders")
    )
    .addSubcommand(sub =>
      sub
        .setName("pause")
        .setDescription("Pause your hydration reminders")
    )
    .addSubcommand(sub =>
      sub
        .setName("resume")
        .setDescription("Resume your paused hydration reminders")
    )
    .addSubcommand(sub =>
      sub
        .setName("show")
        .setDescription("Show your current hydration schedule")
    )
    .addSubcommand(sub =>
      sub
        .setName("drank")
        .setDescription("Log that you hydrated, increments your streak!")
    );
  
  // ------------------ Slash Command Handler ------------------
  
  async function run({ interaction }) {
    // 1) personality check
    const userId = interaction.user.id;
    const personality = userPersonalities.get(userId) || "study";
    if (personality !== "study") {
      return interaction.reply({
        content: "You must have the **study** personality selected to use hydration reminders!",
        ephemeral: true
      });
    }
  
    // 2) parse subcommand
    const sub = interaction.options.getSubcommand();
    const client = interaction.client;
  
    if (sub === "start") {
      const startHour = interaction.options.getInteger("start_hour");
      const endHour = interaction.options.getInteger("end_hour");
      let interval = interaction.options.getInteger("interval");
      if (!interval || interval < 1) interval = 2;
      const dmChoice = interaction.options.getBoolean("dm") || false;
  
      if (
        startHour < 0 || startHour > 23 ||
        endHour < 0 || endHour > 23 ||
        startHour > endHour
      ) {
        return interaction.reply({
          content: "Invalid time range. Use 24-hour format, e.g. start=8 end=20",
          ephemeral: true
        });
      }
  
      const channelChoice = dmChoice ? "dm" : interaction.channelId;
      await startHydrationReminders(client, userId, startHour, endHour, interval, channelChoice);
  
      return interaction.reply({
        content: `Hydration reminders set from **${startHour}:00** to **${endHour}:00** every **${interval}** hour(s).` +
                 (dmChoice ? " (Check your DMs!)" : ""),
        ephemeral: true
      });
    }
  
    if (sub === "stop") {
      cancelAllRemindersForUser(userId);
      delete hydrationReminders[userId];
      saveHydrationReminders();
      return interaction.reply({ content: "Hydration reminders stopped and cleared.", ephemeral: true });
    }
  
    if (sub === "pause") {
      const data = hydrationReminders[userId];
      if (!data) {
        return interaction.reply({ content: "No active hydration reminders to pause.", ephemeral: true });
      }
      data.isPaused = true;
      if (data.timeouts) {
        data.timeouts.forEach(t => clearTimeout(t));
        data.timeouts = [];
      }
      saveHydrationReminders();
      return interaction.reply({ content: "Your hydration reminders are now paused.", ephemeral: true });
    }
  
    if (sub === "resume") {
      const data = hydrationReminders[userId];
      if (!data) {
        return interaction.reply({ content: "No hydration reminders found to resume. Start them first.", ephemeral: true });
      }
      if (!data.isPaused) {
        return interaction.reply({ content: "Your hydration reminders are already running.", ephemeral: true });
      }
      data.isPaused = false;
      cancelAllRemindersForUser(userId);
      await scheduleHydrationRemindersForToday(client, userId);
      saveHydrationReminders();
      return interaction.reply({ content: "Your hydration reminders have resumed.", ephemeral: true });
    }
  
    if (sub === "show") {
      const data = hydrationReminders[userId];
      if (!data) {
        return interaction.reply({ content: "No hydration reminders configured.", ephemeral: true });
      }
      const { startHour, endHour, intervalHours, isPaused, stats } = data;
      const pausedText = isPaused ? "Paused" : "Active";
      const response = `**Hydration Reminders**\n`
        + `Start Hour: ${startHour}\n`
        + `End Hour: ${endHour}\n`
        + `Interval: ${intervalHours || 2}\n`
        + `Status: ${pausedText}\n\n`
        + `**Hydration Stats**\n`
        + `Count: ${stats?.count ?? 0}\n`
        + `Streak: ${stats?.streak ?? 0}\n`;
      return interaction.reply({ content: response, ephemeral: true });
    }
  
    if (sub === "drank") {
      const data = hydrationReminders[userId];
      if (!data) {
        return interaction.reply({ content: "No hydration reminders set. Start them first.", ephemeral: true });
      }
      const now = Date.now();
      const last = data.stats.lastHydrated || 0;
      const hoursSinceLast = (now - last) / (1000 * 60 * 60);
  
      if (hoursSinceLast < 6) {
        data.stats.streak += 1;
      } else {
        data.stats.streak = 1;
      }
      data.stats.count += 1;
      data.stats.lastHydrated = now;
      saveHydrationReminders();
      return interaction.reply({
        content: `Great job! You've hydrated **${data.stats.count}** times. Your streak is now **${data.stats.streak}**.`,
        ephemeral: true
      });
    }
  }
  
  module.exports = {
    onBotReady,
    data,
    run
  };
  