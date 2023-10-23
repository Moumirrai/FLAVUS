import { SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from '../../types/Command';

const Shuffle: SlashCommand = {
  builder: new SlashCommandBuilder()
    .setName('shuffle')
    .setDescription('Shuffles queue'),

  requirements: {
    voiceRequired: true,
    playerRequired: true,
    sameChannelRequired: true
  },

  execute: async ({ interaction, core, player }) => {
    player.queue.shuffle();
    core.emit('queueUpdate', player);
    return core.embeds.info(
      interaction,
      { title: 'The queue has been shuffled!' },
      false
    );
  }
};

export default Shuffle;
