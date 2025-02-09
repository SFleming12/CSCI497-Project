const {
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
  ComponentType,
} = require("discord.js");

const data = {
  name: "select-personality",
  description: "Show personalities using string select menu",
};

/**
 * @param {Object} param0
 * @param {import('discord.js').ChatInputCommandInteraction} param0.interaction
 */

async function run({ interaction }) {
  const personalities = [
    {
      label: "Nice",
      description: "This is a nice chatbot!",
      value: "nice",
    },
    {
      label: "Sarcastic",
      description: "This is a sarcastic chatbot!",
      value: "sarcastic",
    },
    {
      label: "Funny",
      description: "This is a funny chatbot!",
      value: "funny",
    },
  ];

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId(interaction.id)
    .setPlaceholder("Make a selection...")
    .setMinValues(0)
    .setMaxValues(1)
    .addOptions(
      personalities.map((personalities) =>
        new StringSelectMenuOptionBuilder()
          .setLabel(personalities.label)
          .setDescription(personalities.description)
          .setValue(personalities.value)
      )
    );

  const actionRow = new ActionRowBuilder().addComponents(selectMenu);

  const reply = await interaction.reply({
    components: [actionRow],
  });

  const collector = reply.createMessageComponentCollector({
    componentType: ComponentType.StringSelect,
    filter: (i) =>
      i.user.id === interaction.user.id && i.customId === interaction.id,
    time: 60_000,
  });

  collector.on("collect", (interaction) => {
    if (!interaction.values.length) {
      interaction.reply("You have emptied your selection.");
      return;
    }

    interaction.reply(`You have now selected: ${interaction.values.join(",")}`);
  });
}

module.exports = { data, run };
