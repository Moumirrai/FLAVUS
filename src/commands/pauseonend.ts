import { MessageReaction } from 'discord.js';
import { CommandArgs, iCommand } from 'my-module';

const PauseOnEndCommand: iCommand = {
  name: 'pausedelayed',
  aliases: ['paused', 'psd'],
  voiceRequired: true,
  joinPermissionRequired: false,
  playerRequired: true,
  sameChannelRequired: true,
  visible: true,
  description: 'Pauses player when the current track ends',
  usage: '<prefix>pauseonend',
  async execute({ client, message, player }: CommandArgs): Promise<void | MessageReaction> {
    player.set('pauseOnEnd', true);
    message.react('✅').catch((e) => {});
  }
};

export default PauseOnEndCommand;
