import { Message, MessageEmbed } from 'discord.js';
import { CommandArgs, iCommand } from 'flavus';

const PauseCommand: iCommand = {
  name: 'pause',
  aliases: ['ps'],
  voiceRequired: true,
  playerRequired: true,
  sameChannelRequired: true,
  visible: true,
  description: 'Pauses the current track',
  usage: '<prefix>pause',
  async execute({
    client,
    message,
    player
  }: CommandArgs): Promise<void | Message> {
    if (!player.playing) {
      return message.channel
        .send({
          embeds: [
            new MessageEmbed()
              .setColor(client.config.embed.color)
              .setTitle('I am already paused!')
          ]
        })
        .then((msg) => {
          setTimeout(() => {
            msg.delete().catch((e) => {
              client.logger.error(e);
            });
            message.delete().catch((e) => {
              client.logger.error(e);
            });
          }, 5000);
        });
    }
    player.pause(true);
    message.react('⏸️').catch((e) => {
      client.logger.error(e);
    });
  }
};

export default PauseCommand;
