import { SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from '../../types/Command';

const Volume: SlashCommand = {
  builder: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Sets the volume of the player')
    .addIntegerOption((option) =>
      option
        .setName('value')
        .setMaxValue(100)
        .setMinValue(0)
        .setDescription('The volume you want to set')
        .setRequired(false)
    ),

  requirements: {
    voiceRequired: true,
    sameChannelRequired: true,
    playerRequired: true
  },

  execute: async ({ interaction, core, player }) => {
    const volume = interaction.options.getInteger('value');
    if (!volume)
      return core.embeds.info(interaction, {
        title: `Current volume is ${player.volume}%`
      });
    player.setVolume(volume);
    const doc = await core.functions.fetchGuildConfig(interaction.guild.id);
    if (!doc)
      return core.embeds.error(interaction, { title: 'Something went wrong!' });
    doc.volume = volume;
    await doc.save();
    return core.embeds.info(interaction, {
      title: `Volume set to ${volume}%`
    });
  }
};

export default Volume;
