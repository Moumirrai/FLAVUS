import { SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from '../../types/Command';

const Stop: SlashCommand = {
  builder: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stops the player and leaves the channel'),

  requirements: {
    playerRequired: true
  },

  execute: async ({ interaction, core, player }) => {
    core.logger.log('Stopping player, code 102');
    player.destroy();
    return core.embeds.info(interaction, {
      title: 'Stopped!'
    });
  }
};

export default Stop;
