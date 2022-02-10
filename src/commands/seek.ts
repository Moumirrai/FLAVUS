import { Message, MessageEmbed } from 'discord.js';
import { CommandArgs, iCommand } from 'my-module';
import formatDuration = require('format-duration');

const SeekCommand: iCommand = {
  name: 'seek',
  aliases: ['s'],
  voiceRequired: true,
  joinPermissionRequired: false,
  playerRequired: true,
  sameChannelRequired: true,
  visible: true,
  description: 'Seeks to given time',
  usage: `\`<prefix>seek 10\` or \`<prefix>seek 1:24:25\``,
  async execute({ client, message, args, player }: CommandArgs): Promise<any> {
    if (!player.queue.current) {
      return message.channel.send({
        // send success message
        embeds: [
          new MessageEmbed()
            .setTitle(`I am not playing anything right now!`)
            .setColor(client.config.embed.color)
        ]
      });
    }
    if (!args[0]) {
      // if no args return error
      return message.channel.send({
        // send success message
        embeds: [
          new MessageEmbed()
            .setTitle(`You must provide a time to seek to!`)
            .setDescription(
              `You may seek from \`0 - ${formatDuration(
                player.queue.current.duration,
                { leading: true }
              )}\``
            )
            .setColor(client.config.embed.color)
        ]
      });
    }
    const timeSplit = args[0].split(':');
    if (!timeSplit.every((item) => !isNaN(Number(item)) && item.length > 0)) {
      // if time is not in correct format return error
      return message.channel.send({
        // send success message
        embeds: [
          new MessageEmbed()
            .setTitle(`Time is not in correct format!`)
            .setColor(client.config.embed.errorcolor)
        ]
      });
    }
    let seek;
    if (timeSplit.length === 1) {
      seek = Number(timeSplit[0]) * 1000;
    } else if (timeSplit.length === 2) {
      // if time is in minutes and seconds
      seek = Number(timeSplit[0]) * 1000 * 60 + Number(timeSplit[1]) * 1000;
    } else if (timeSplit.length === 3) {
      // if time is in hours, minutes and seconds
      seek =
        Number(timeSplit[0]) * 1000 * 60 * 60 +
        Number(timeSplit[1]) * 1000 * 60 +
        Number(timeSplit[2]) * 1000;
    } else {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setTitle(`Time is not in correct format!`)
            .setColor(client.config.embed.errorcolor)
        ]
      });
    }
    if (seek < 0 || seek >= player.queue.current.duration)
      // if user tries to seek to a time that is not in the track return error
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setTitle(`I can't seek to that time!`)
            .setDescription(
              `You may seek from \`0 - ${formatDuration(
                player.queue.current.duration,
                { leading: true }
              )}\``
            )
            .setColor(client.config.embed.errorcolor)
        ]
      });
    player.seek(seek); // seek to time
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
