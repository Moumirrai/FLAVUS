import { MessageEmbed } from 'discord.js';
import { CommandArgs, Command } from 'flavus';

const PauseCommand: Command = {
  name: 'pause',
  aliases: ['ps'],
  visible: true,
  description: 'Pauses the current track',
  usage: '<prefix>pause',
  requirements: {
    voiceRequired: true,
    playerRequired: true,
    sameChannelRequired: true
  },
  
  async execute({ client, message, player }: CommandArgs) {
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
