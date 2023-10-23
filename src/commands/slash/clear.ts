import { SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from '../../types/Command';

const Clear: SlashCommand = {
  builder: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Clears the queue'),

  requirements: {
    voiceRequired: true,
    sameChannelRequired: true,
    playerRequired: true
  },

  execute: async ({ interaction, core, player }) => {
    if (player.queue.size !== 0) {
      player.queue.clear();
      core.emit('queueUpdate', player);
      return core.embeds.info(interaction, {
        title: 'Queue cleared!'
      });
    }
    return core.embeds.error(interaction, { title: 'Queue is already empty!' });
  }
};

export default Clear;
