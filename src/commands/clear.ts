import { MessageReaction } from 'discord.js';
import { CommandArgs, iCommand } from 'flavus';

const ClearCommand: iCommand = {
  name: 'clear',
  aliases: [],
  voiceRequired: true,
  joinPermissionRequired: false,
  playerRequired: true,
  sameChannelRequired: true,
  visible: true,
  description: 'Clears the queue',
  usage: 'clear',
  async execute({
    client,
    message,
    player
  }: CommandArgs): Promise<void | MessageReaction> {
    if (player.queue.size !== 0) {
      player.queue.clear();
      return message.react('✅').catch((e) => {});
    }
  }
};

export default ClearCommand;
