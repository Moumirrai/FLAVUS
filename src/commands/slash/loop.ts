import { SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from '../../types/Command';

const Loop: SlashCommand = {
  builder: new SlashCommandBuilder()
    .setName('loop')
    .setDescription('Plays current track on loop'),

  requirements: {
    voiceRequired: true,
    sameChannelRequired: true,
    playerRequired: true
  },

  execute: async ({ interaction, core, player }) => {
    if (!player.trackRepeat) {
      player.setTrackRepeat(true);
      return core.embeds.info(interaction, { title: 'Track loop enabled!' });
    }
    player.setTrackRepeat(false);
    return core.embeds.info(interaction, { title: 'Track loop disabled!' });
  }
};

export default Loop;
