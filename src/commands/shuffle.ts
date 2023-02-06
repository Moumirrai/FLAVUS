import { MessageReaction } from 'discord.js';
import { CommandArgs, iCommand } from 'flavus';

const ShuffleCommand: iCommand = {
  name: 'shuffle',
  aliases: [],
  voiceRequired: true,
  playerRequired: true,
  sameChannelRequired: true,
  visible: true,
  description: 'Shuffles queue',
  usage: `<prefix>shuffle`,
  async execute({ client, message, player }: CommandArgs): Promise<void|MessageReaction> {
    player.queue.shuffle();
    client.emit('queueUpdate', player);
    return message.react('🔀').catch((e) => {
      client.logger.error(e);
    });
  }
};

export default ShuffleCommand;
