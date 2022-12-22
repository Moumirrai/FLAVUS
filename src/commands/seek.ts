import { Message, MessageEmbed } from 'discord.js';
import { CommandArgs, iCommand } from 'flavus';
import formatDuration = require('format-duration');

const SeekCommand: iCommand = {
  name: 'seek',
  aliases: ['sk', 'goto'],
  voiceRequired: true,
  joinPermissionRequired: false,
  playerRequired: true,
  sameChannelRequired: true,
  visible: true,
  description: `Seeks to given time. Time can by provided in \`ss\`, \`mm:ss\` or \`hh:mm:ss\`.\nYou don't have to put zero before one digit number, just divide them using \`:\``,
  usage: `\`<prefix>seek 10 , <prefix>seek 02:22 or <prefix>seek 1:5:25\``,
  async execute({ client, message, args, player }: CommandArgs): Promise<Message> {
    //TODO: maybe create reusable condition check for player.current in messageCreate event, since multiple commands require it
    if (!player.queue.current) {
      return message.channel.send(
        client.embeds.error('I am not playing anything right now!')
      );
    }
    if (!args[0]) {
      return message.channel.send(
        client.embeds.error(
          'You must provide a time to seek to!',
          `You may seek from \`0 - ${formatDuration(
            player.queue.current.duration,
            { leading: true }
          )}\``
        )
      );
    }
    const timeSplit = args[0].split(':');
    if (!timeSplit.every((item) => !isNaN(Number(item)) && item.length > 0)) {
      return message.channel.send(
        client.embeds.error(
          'Time is not in correct format!',
          `Use \`${client.config.prefix}help seek\` for more info.`
        )
      );
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
      return message.channel.send(
        client.embeds.error(
          'Time is not in correct format!',
          `Use \`${client.config.prefix}help seek\` for more info.`
        )
      );
    }
    if (seek < 0 || seek >= player.queue.current.duration)
      return message.channel.send(
        client.embeds.error(
          `It's not possible to seek to that time!`,
          `You may seek from \`0 - ${formatDuration(
            player.queue.current.duration,
            { leading: true }
          )}\``
        )
      );
    player.seek(seek);
    return message.channel.send({
      // send success message
      embeds: [
        new MessageEmbed()
          .setTitle(
            `Seeked to - ${formatDuration(player.position, { leading: true })}`
          )
          .setDescription(client.functions.createProgressBar(player))
          .setColor(client.config.embed.color)
      ]
    });
  }
};

export default SeekCommand;
