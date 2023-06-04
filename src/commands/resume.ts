import { MessageEmbed } from 'discord.js';
import { CommandArgs, Command } from 'flavus';

const ResumeCommand: Command = {
  name: 'resume',
  aliases: ['rs'],
  description: 'Resumes music if paused',
  usage: '<prefix>resume',
  requirements: {
    voiceRequired: true,
    playerRequired: true,
    sameChannelRequired: true
  },

  async execute({ client, message, player }: CommandArgs) {
    if (player.playing) {
      return message.channel
        .send({
          embeds: [
            new MessageEmbed()
              .setColor(client.config.embed.color)
              .setTitle('I am not paused!')
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
    player.pause(false);
    message.react('⏯').catch((e) => {
      client.logger.error(e);
    });
  }
};

export default ResumeCommand;
