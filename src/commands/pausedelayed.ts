import { MessageReaction } from 'discord.js';
import { CommandArgs, iCommand } from 'flavus';

const PauseOnEndCommand: iCommand = {
  name: 'pausedelayed',
  aliases: ['paused', 'psd'],
  voiceRequired: true,
  joinPermissionRequired: false,
  playerRequired: true,
  sameChannelRequired: true,
  visible: true,
  description: 'Pauses player when the current track ends',
  usage: '<prefix>paused',
  async execute({
    client,
    message,
    player
  }: CommandArgs): Promise<void | MessageReaction> {
    const pause = player.get('pauseOnEnd');
    if (pause !== undefined) {
      player.set('pauseOnEnd', !pause);
      if (!pause) {
        return message.react('👌').catch((e) => {});
      } else {
        return message.react('❌').catch((e) => {});
      }
    } else {
      player.set('pauseOnEnd', true);
      return message.react('👌').catch((e) => {});
    }
  }
};

export default PauseOnEndCommand;
