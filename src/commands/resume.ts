import { Message, MessageEmbed } from 'discord.js';
import { CommandArgs, iCommand } from 'my-module';

const PauseCommand: iCommand = {
  name: 'resume',
  aliases: ['rs'],
  voiceRequired: true,
  joinPermissionRequired: false,
  playerRequired: true,
  sameChannelRequired: true,
  visible: true,
  description: 'Resumes music if paused',
  usage: '<prefix>resume',
  async execute({ client, message, player }: CommandArgs): Promise<Message> {
    if (player.playing) {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.config.embed.color)
            .setTitle('I am not paused!')
        ]
      });
    }
    player.pause(false);
    message.react('⏯').catch((e) => {});
  }
};

export default PauseCommand;
