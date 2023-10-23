import { SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from '../../types/Command';

const Resume: SlashCommand = {
  builder: new SlashCommandBuilder()
    .setName('resume')
    .setDescription('Resumes music if paused'),

  requirements: {
    voiceRequired: true,
    sameChannelRequired: true,
    playerRequired: true
  },

  execute: async ({ interaction, core, player }) => {
    if (player.playing) {
      return core.embeds.error(interaction, 'Player is not paused!');
    }
    player.pause(false);
    return core.embeds.info(interaction, {
      title: 'Resumed!'
    });
  }
};

export default Resume
