import { CommandArgs, iCommand } from 'flavus';
import formatDuration from 'format-duration';

const SeekCommand: iCommand = {
  name: 'seek',
  aliases: ['sk', 'goto'],
  voiceRequired: true,
  playerRequired: true,
  sameChannelRequired: true,
  visible: true,
  description: "Seeks to given time. Time can by provided in \`ss\`, \`mm:ss\` or \`hh:mm:ss\`.\nYou don't have to put zero before one digit number, just divide them using \`:\`",
  usage: "\`<prefix>seek 10 , <prefix>seek 02:22 or <prefix>seek 1:5:25\`",
  async execute({
    client,
    message,
    args,
    player
  }: CommandArgs) {
    //TODO: maybe create reusable condition check for player.current in messageCreate event, since multiple commands require it
    if (!player.queue.current) {
      return client.embeds.error(
        message.channel,
        'I am not playing anything right now!'
      );
    }
    if (!args[0]) {
      return client.embeds.error(message.channel, {
        title: 'You must provide a time to seek to!',
        description: `You may seek from \`0 - ${formatDuration(
          player.queue.current.duration,
          { leading: true }
        )}\``
      });
    }
    const timeSplit = args[0].split(':');
    if (!timeSplit.every((item) => !isNaN(Number(item)) && item.length > 0)) {
      return client.embeds.error(message.channel, {
        title: 'Time is not in correct format!',
        description: `Use \`${client.config.prefix}help seek\` for more info.`
      });
    }
    let seek;
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
      return client.embeds.error(message.channel, {
        title: 'Time is not in correct format!',
        description: `Use \`${client.config.prefix}help seek\` for more info.`
      });
    }
    if (seek < 0 || seek >= player.queue.current.duration)
      return client.embeds.error(message.channel, {
        title: 'Time is not in correct format!',
        description: `Use \`${client.config.prefix}help seek\` for more info.`
      });
    player.seek(seek);
    return client.embeds.info(message.channel, {
      title: `Seeked to - ${formatDuration(player.position, {
        leading: true
      })}`,
      description: client.functions.createProgressBar(player)
    });
  }
};

export default SeekCommand;
