import { MessageEmbed } from 'discord.js';
import { CommandArgs, Command } from 'flavus';
import formatDuration = require('format-duration');

const GrabCommand: Command = {
  name: 'grab',
  aliases: ['g', 'save', 'sv'],
  description: 'Sends info about the current track to your DM',
  usage: '<prefix>grab',
  requirements: {
    playerRequired: true,
    currentTrackRequired: true
  },

  async execute({ client, message, player }: CommandArgs) {
    message.author
      .send({
        embeds: [
          new MessageEmbed()
            .setThumbnail(
              `https://img.youtube.com/vi/${player.queue.current.identifier}/mqdefault.jpg`
            )
            .setURL(player.queue.current.uri)
            .setColor(client.config.embed.color)
            .setTitle(`${player.queue.current.title}`)
            .addFields(
              {
                name: 'Duration:',
                value: `\`${formatDuration(player.queue.current.duration, {
                  leading: true
                })}\``,
                inline: true
              },
              {
                name: 'Current timestamp',
                value: `\`${formatDuration(player.position, {
                  leading: true
                })}\` [LINK](${
                  player.queue.current.uri +
                  '&t=' +
                  String(Math.round(player.position / 1000))
                })`,
                inline: true
              },
              {
                name: 'Author',
                value: `\`${player.queue.current.author}\``,
                inline: true
              }
            )
            .setTimestamp()
            .setFooter({
              text: `Requested in - ${message.guild.name}`,
              iconURL: message.guild.iconURL()
            })
        ]
      })
      .catch((e) => {
        client.logger.error(e);
      });
    return message.delete().catch((e) => {
      client.logger.error(e);
    });
  }
};

export default GrabCommand;
