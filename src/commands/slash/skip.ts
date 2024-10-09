import { SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from '../../types/Command';

const Skip: SlashCommand = {
  builder: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skips to next or specific track')
    .addIntegerOption((option) =>
      option
        .setName('track')
        .setMinValue(1)
        .setDescription('The track number you want to skip to')
        .setRequired(false)
    )  as SlashCommandBuilder,

  requirements: {
    voiceRequired: true,
    sameChannelRequired: true,
    playerRequired: true
  },

  execute: async ({ interaction, core, player }) => {
    const track = interaction.options.getInteger('track');
    if (track) {
      if (player.queue.length === 0)
        return core.embeds.error(
          interaction,
          'There are no tracks in the queue!'
        );
      if (track > player.queue.length) {
        return core.embeds.error(interaction, {
          title: 'Invalid track number',
          description: `There are only ${player.queue.length} tracks in the queue!`
        });
      }
      core.embeds.info(interaction, {
        title: 'Skipped!',
        description: `Skipped to track ${track} - ${
          player.queue[track - 1].title
        }`
      });
      return player.stop(track);
    } else {
      player.stop();
      return core.embeds.info(interaction, {
        title: 'Skipped!'
      });
    }
  }
};

export default Skip
