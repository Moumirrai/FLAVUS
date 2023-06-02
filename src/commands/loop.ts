import { CommandArgs, iCommand } from 'flavus';

const LoopCommand: iCommand = {
  name: 'loop',
  aliases: ['ll', 'lo'],
  voiceRequired: true,
  playerRequired: true,
  sameChannelRequired: true,
  visible: true,
  description: 'Plays the current track in a loop',
  usage: '<prefix>loop',
  async execute({
    client,
    message,
    player
  }: CommandArgs) {
    if (!player.trackRepeat) {
      player.setTrackRepeat(true);
      return message.react('🔂').catch((e) => {
        client.logger.error(e);
      });
    }
    player.setTrackRepeat(false);
    message.react('❌').catch((e) => {
      client.logger.error(e);
    });
  }
};

export default LoopCommand;
