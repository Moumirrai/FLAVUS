import { Message, MessageEmbed } from 'discord.js';
import { CommandArgs, iCommand } from 'my-module';
import formatDuration = require('format-duration');
import fetch from 'node-fetch';

const PingCommand: iCommand = {
  name: 'stats',
  aliases: [],
  voiceRequired: false,
  joinPermissionRequired: false,
  playerRequired: false,
  sameChannelRequired: false,
  visible: false,
  description: 'stats_description',
  usage: 'stats',
  async execute({ client, message }: CommandArgs): Promise<Message> {
    return message.channel
      .send({
        embeds: [
          new MessageEmbed()
            .setColor(client.config.embed.color)
            .setTitle('Measuring...')
        ]
      })
      .then(async (msg) => {
        msg.delete();
        return message.channel.send({
          embeds: [
            new MessageEmbed()
              .setColor(client.config.embed.color)
              .setTitle('Statistics').setDescription(`Name - \`${
              client.user.tag
            }\`
        ID - \`[${client.user.id}]\`
        Latency - \`${msg.createdTimestamp - message.createdTimestamp}ms\`
        Api Latency - \`${Math.round(client.ws.ping)}ms\`
        Runtime - \`${formatDuration(client.uptime, { leading: true })}\`
        Memory usage - \`${(
          process.memoryUsage().heapUsed /
          1024 /
          1024
        ).toFixed(2)}mb\`
        Active players - \`${client.manager.players.size}\``)
          ]
        });
      });
  }
};

export default PingCommand;
