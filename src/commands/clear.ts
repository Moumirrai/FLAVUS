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
  }: CommandArgs) {
    if (player.queue.size !== 0) {
      player.queue.clear();
      client.emit('queueUpdate', player);
      return message.react('✅').catch((e) => {
        client.logger.error(e);
      });
    }
  }
};

export default ClearCommand;
