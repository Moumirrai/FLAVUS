import { Message, MessageEmbed } from 'discord.js';
import { CommandArgs, iCommand } from 'flavus';

const DashboardCommand: iCommand = {
  name: 'dashboard',
  aliases: ['cf', 'cfg', 'config', 'dsb', 'web'],
  voiceRequired: false,
  joinPermissionRequired: false,
  playerRequired: false,
  sameChannelRequired: false,
  visible: true,
  description: 'Sends a dashboard url',
  usage: 'config',
  async execute({ client, message }: CommandArgs): Promise<Message> {
    return message.channel.send({
      embeds: [
        new MessageEmbed()
          .setColor(client.config.embed.color)
          .setTitle('Web interface')
          .setURL('https://flavus.xyz/')
          .setImage('https://cdn.discordapp.com/attachments/916984352997531649/1017111813193736353/Icon.png')
      ]
    });
  }
};

export default DashboardCommand;
