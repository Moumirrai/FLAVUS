import { CommandArgs, Command } from 'flavus';

const LoopCommand: Command = {
  name: 'loop',
  aliases: ['ll', 'lo'],
  description: 'Plays the current track in a loop',
  usage: '<prefix>loop',
  requirements: {
    voiceRequired: true,
    playerRequired: true,
    sameChannelRequired: true
  },

  async execute({ client, message, player }: CommandArgs) {
    if (!player.trackRepeat) {
      player.setTrackRepeat(true);
      return message.react('🔂').catch((e) => {
        client.logger.error(e);
      });
    }
    player.setTrackRepeat(false);
    return message.react('❌').catch((e) => {
      client.logger.error(e);
    });
  }
};

export default LoopCommand;
