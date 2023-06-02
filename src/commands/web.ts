import { Message } from 'discord.js';
import { CommandArgs, iCommand } from 'flavus';

const DashboardCommand: iCommand = {
  name: 'dashboard',
  aliases: ['web'],
  visible: true,
  description: 'Sends a dashboard url',
  usage: 'config',
  async execute({ client, message }: CommandArgs) {
    return client.embeds.info(message.channel, {
      title: 'Web interface',
      url: 'https://flavus.xyz/',
      image: {
        url: 'https://cdn.discordapp.com/attachments/916984352997531649/1017111813193736353/Icon.png'
      }
    });
  }
};

export default DashboardCommand;
