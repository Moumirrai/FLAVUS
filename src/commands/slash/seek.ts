import { SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from '../../types/Command';
import formatDuration from 'format-duration';

const Seek: SlashCommand = {
  builder: new SlashCommandBuilder()
    .setName('seek')
    .setDescription('Seeks to a timestamp in the current track')
    .addStringOption((option) =>
      option
        .setName('timestamp')
        .setDescription(
          'Timestamp to seek to in format `hh:mm:ss` or `ss` e.g. `1:30` or `90`'
        )
        .setRequired(true)
    ) as SlashCommandBuilder,

  requirements: {
    voiceRequired: true,
    sameChannelRequired: true,
    playerRequired: true
  },

  execute: async ({ interaction, core, player }) => {
    if (!player.queue.current)
      return core.embeds.error(interaction, 'There is no track playing!');
    const time = interaction.options.getString('timestamp');
    const timeSplit = time.split(':');
    if (!timeSplit.every((item) => !isNaN(Number(item)) && item.length > 0)) {
      return core.embeds.error(interaction, 'Invalid timestamp provided!');
    }
    let seek: number;
    if (timeSplit.length === 1) {
      seek = Number(timeSplit[0]) * 1000;
    } else if (timeSplit.length === 2) {
      // if time is in mm:ss
      seek = Number(timeSplit[0]) * 1000 * 60 + Number(timeSplit[1]) * 1000;
    } else if (timeSplit.length === 3) {
      // if time is in hh:mm:ss
      seek =
        Number(timeSplit[0]) * 1000 * 60 * 60 +
        Number(timeSplit[1]) * 1000 * 60 +
        Number(timeSplit[2]) * 1000;
    } else {
      return core.embeds.error(interaction, 'Invalid timestamp provided!');
    }
    if (seek < 0 || seek >= player.queue.current.duration)
      return core.embeds.error(interaction, {
        title: 'Invalid timestamp provided!',
        description: `You may seek from \`0 - ${formatDuration(
          player.queue.current.duration,
          { leading: true }
        )}\``
      });
    player.seek(seek);
    return core.embeds.info(
      interaction,
      {
        title: `Seeked to - ${formatDuration(player.position, {
          leading: true
        })}`,
        description: core.functions.createProgressBar(player)
      },
      false
    );
  }
};

export default Seek;
