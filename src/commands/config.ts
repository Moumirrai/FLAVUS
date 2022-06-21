import { Message, MessageEmbed } from 'discord.js';
import { CommandArgs, iCommand } from 'flavus';

const DashboardCommand: iCommand = {
  name: 'dashboard',
  aliases: ["cf", "cfg", "config", "dsb", "web"],
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
          .setTitle('Dashboard')
          .setURL("http://130.61.29.155:8080/")
      ]
    });
  }
};

export default DashboardCommand;
