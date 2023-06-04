import { CommandArgs, Command } from 'flavus';

const ShuffleCommand: Command = {
  name: 'shuffle',
  description: 'Shuffles queue',
  usage: "<prefix>shuffle",
  requirements: {
    voiceRequired: true,
    playerRequired: true,
    sameChannelRequired: true
  },

  async execute({ client, message, player }: CommandArgs) {
    player.queue.shuffle();
    client.emit('queueUpdate', player);
    return message.react('🔀').catch((e) => {
      client.logger.error(e);
    });
  }
};

export default ShuffleCommand;
