import {
  Message,
  MessageEmbed,
} from 'discord.js';
import { CommandArgs, iCommand } from 'flavus';
import formatDuration = require('format-duration');
import { Player } from 'erela.js';

const GrabCommand: iCommand = {
  name: 'grab',
  aliases: ['g', 'save', 'sv'],
  voiceRequired: false,
  joinPermissionRequired: false,
  playerRequired: true,
  sameChannelRequired: false,
  visible: true,
  description: 'Sends info about the current track to your DM',
  usage: '<prefix>grab',
  async execute({ client, message, player }: CommandArgs): Promise<void | Message> {
    if (!player || !player.queue.current) { // if there is no player or no current track
      message.author.send({
        embeds: [new MessageEmbed()
          .setColor(client.config.embed.wrongcolor)
          .setTitle(`There is no song playing right now!`)
          .setTimestamp()
          .setFooter({ text: `Requested in - ${message.guild.name}`, iconURL: message.guild.iconURL()})
        ]
      });
      return message.delete().catch((e) => {});
    }
    message.author.send({
      embeds: [new MessageEmbed()
        .setThumbnail(`https://img.youtube.com/vi/${player.queue.current.identifier}/mqdefault.jpg`)
        .setURL(player.queue.current.uri)
        .setColor(client.config.embed.color)
        .setTitle(`${player.queue.current.title}`)
        .addField(`Duration:`, `\`-\``, true)
        .addField(`Current timestamp`, `\`${formatDuration(player.position, { leading: true })}\` [LINK](${player.queue.current.uri + "&t=" + String(Math.round(player.position / 1000))})`, true)
        .addField(`Author`, `\`${player.queue.current.author}\``, true)
        .setTimestamp()
        .setFooter({ text: `Requested in - ${message.guild.name}`, iconURL: message.guild.iconURL()})
      ]
    }).catch(e => {
      message.author.send('Error')
      return message.delete().catch((e) => {});
    })
    return message.delete().catch((e) => {});
  }
};

export default GrabCommand;
