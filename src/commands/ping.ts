import { MessageEmbed } from 'discord.js';
import { CommandArgs, Command } from 'flavus';

const PingCommand: Command = {
  name: 'ping',
  visible: true,
  description: 'ping_description',
  usage: '<prefix>ping',
  
  async execute({ client, message }: CommandArgs) {
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
