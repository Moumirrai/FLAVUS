import { SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from '../../types/Command';

const PauseDelayed: SlashCommand = {
  builder: new SlashCommandBuilder()
    .setName('pauseonend')
    .setDescription('Pauses the player when current track ends')
    .addBooleanOption((option) =>
      option
        .setName('enabled')
        .setDescription('The value you want to set')
        .setRequired(false)
    ) as SlashCommandBuilder,

  requirements: {
    voiceRequired: true,
    sameChannelRequired: true,
    playerRequired: true
  },

  execute: async ({ interaction, core, player }) => {
    const pause = player.get('pauseOnEnd');
    const enabled = interaction.options.getBoolean('enabled');
    if (enabled === null)
      return core.embeds.info(interaction, {
        title: `Current value is ${pause}`
      });
    if (enabled) player.set('pauseOnEnd', true);
    else player.set('pauseOnEnd', false);
    return core.embeds.info(interaction, {
      title: `Player ${
        enabled ? 'will' : 'will not'
      } be paused when current track ends!`
    });
  }
};

export default PauseDelayed;
