import { Message, MessageEmbed } from 'discord.js';
import { CommandArgs, iCommand } from 'my-module';

const PauseCommand: iCommand = {
  name: 'pause',
  aliases: ['ps'],
  voiceRequired: true,
  joinPermissionRequired: false,
  playerRequired: true,
  sameChannelRequired: true,
  visible: true,
  description: 'Pauses the current track',
  usage: '<prefix>pause',
  async execute({ client, message, player }: CommandArgs): Promise<Message> {
    if (!player.playing) {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.config.embed.color)
            .setTitle('I am already paused!')
        ]
      });
    }
    player.pause(true);
    message.react('⏸️').catch((e) => {});
  }
};

export default PauseCommand;
