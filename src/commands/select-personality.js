const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } = require("discord.js");

const data = {
  name: "select-personality",
  description: "Choose the chatbot's personality using a select menu",
};

async function run({ interaction }) {
  const personalities = [
    { label: "Nice", description: "This is a nice chatbot!", value: "nice" },
    { label: "Kind", description: "A compassionate chatbot eager to help.", value: "kind" },
    { label: "Witty", description: "A chatbot with clever jokes and humor.", value: "witty" },
    { label: "Charismatic", description: "A charming chatbot with magnetic energy.", value: "charismatic" },
    { label: "Optimistic", description: "A positive chatbot who sees the bright side.", value: "optimistic" },


    { label: "Sarcastic", description: "A chatbot with dry, playful sarcasm.", value: "sarcastic" },
    { label: "Reserved", description: "A quiet chatbot, introspective and calm.", value: "reserved" },
    { label: "Blunt", description: "A direct and straightforward chatbot.", value: "blunt" },
    { label: "Stoic", description: "An  emotionally controlled chatbot, composed and calm.", value: "stoic" },

    { label: "Arrogant", description: "A chatbot who believes it's superior to others.", value: "arrogant" },
    { label: "Pessimistic", description: "A chatbot who expects the worst in everything", value: "pessimistic" },
    { label: "Manipulative", description: "A chatbot who subtly influences others for gain", value: "manipulative" },
    { label: "Impulsive", description: "A chatbot who acts quickly without thinking", value: "impulsive" },

    { label: "Funny", description: "This is a funny chatbot!", value: "funny" },
  ];

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId(`select-personality-${interaction.id}`)
    .setPlaceholder("Choose a chatbot personality...")
    .setMaxValues(1)
    .addOptions(
      personalities.map((p) =>
        new StringSelectMenuOptionBuilder().setLabel(p.label).setDescription(p.description).setValue(p.value)
      )
    );

  const actionRow = new ActionRowBuilder().addComponents(selectMenu);

  await interaction.reply({ components: [actionRow], ephemeral: true });
}

module.exports = { data, run };
