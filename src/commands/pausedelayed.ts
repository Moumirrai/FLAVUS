import { CommandArgs, Command } from 'flavus';

const PauseOnEndCommand: Command = {
  name: 'pausedelayed',
  aliases: ['paused', 'psd'],
  description: 'Pauses player when the current track ends',
  usage: '<prefix>paused',
  requirements: {
    voiceRequired: true,
    playerRequired: true,
    sameChannelRequired: true
  },
  
  async execute({
    client,
    message,
    player
  }: CommandArgs) {
    const pause = player.get('pauseOnEnd');
    if (pause !== undefined) {
      player.set('pauseOnEnd', !pause);
      if (!pause) {
        return message.react('👌').catch((e) => {
          client.logger.error(e);
        });
      } else {
        return message.react('❌').catch((e) => {
          client.logger.error(e);
        });
      }
    } else {
      player.set('pauseOnEnd', true);
      return message.react('👌').catch((e) => {
        client.logger.error(e);
      });
    }
  }
};

export default PauseOnEndCommand;
