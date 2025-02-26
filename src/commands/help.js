const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } = require("discord.js");

const data = {
  name: "help",
  description: "View help for personality-specific commands using a select menu",
};

async function run({ interaction }) {
  const personalities = [
    { label: "Nice", description: "Commands for a Nice personality", value: "nice" },
    { label: "Kind", description: "Commands for a Kind personality", value: "kind" },
    { label: "Witty", description: "Commands for a Witty personality", value: "witty" },
    { label: "Charismatic", description: "Commands for a Charismatic personality", value: "charismatic" },
    { label: "Optimistic", description: "Commands for an Optimistic personality", value: "optimistic" },
    { label: "Sarcastic", description: "Commands for a Sarcastic personality", value: "sarcastic" },
    { label: "Reserved", description: "Commands for a Reserved personality", value: "reserved" },
    { label: "Blunt", description: "Commands for a Blunt personality", value: "blunt" },
    { label: "Stoic", description: "Commands for a Stoic personality", value: "stoic" },
    { label: "Arrogant", description: "Commands for an Arrogant personality", value: "arrogant" },
    { label: "Pessimistic", description: "Commands for a Pessimistic personality", value: "pessimistic" },
    { label: "Manipulative", description: "Commands for a Manipulative personality", value: "manipulative" },
    { label: "Impulsive", description: "Commands for an Impulsive personality", value: "impulsive" },
    { label: "Funny", description: "Commands for a Funny personality", value: "funny" },
  ];

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId(`help-${interaction.id}`)
    .setPlaceholder("Select a personality to view its commands...")
    .setMaxValues(1)
    .addOptions(
      personalities.map((p) =>
        new StringSelectMenuOptionBuilder()
          .setLabel(p.label)
          .setDescription(p.description)
          .setValue(p.value)
      )
    );

  const actionRow = new ActionRowBuilder().addComponents(selectMenu);

  await interaction.reply({
    content: "Select a personality category to see its available commands:",
    components: [actionRow],
    ephemeral: true,
  });
}

module.exports = { data, run };
