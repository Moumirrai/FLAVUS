import { SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from '../../types/Command';

const Puase: SlashCommand = {
  builder: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Pauses the current song'),

  requirements: {
    voiceRequired: true,
    sameChannelRequired: true,
    playerRequired: true
  },

  execute: async ({ interaction, core, player }) => {
    if (!player.playing) {
      return core.embeds.error(interaction, 'Player is already paused!');
    }
    player.pause(true);
    return core.embeds.info(interaction, {
      title: 'Paused!'
    });
  }
};

export default Puase;