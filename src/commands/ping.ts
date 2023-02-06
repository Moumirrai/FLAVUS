import { Message, MessageEmbed } from 'discord.js';
import { CommandArgs, iCommand } from 'flavus';

const PingCommand: iCommand = {
  name: 'ping',
  aliases: [],
  visible: true,
  description: 'ping_description',
  usage: '<prefix>ping',
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
              .setTitle('Pong!')
              .setDescription(
                `Latency - \`${
                  msg.createdTimestamp - message.createdTimestamp
                }ms\`\nAPI Latency - \`${Math.round(client.ws.ping)}ms\``
              )
          ]
        });
      });
  }
};

export default PingCommand;
