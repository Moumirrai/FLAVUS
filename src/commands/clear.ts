import { CommandArgs, Command } from 'flavus';

const ClearCommand: Command = {
  name: 'clear',
  description: 'Clears the queue',
  usage: 'clear',
  requirements: {
    voiceRequired: true,
    playerRequired: true,
    sameChannelRequired: true
  },

  async execute({ client, message, player }: CommandArgs) {
    if (player.queue.size !== 0) {
      player.queue.clear();
      client.emit('queueUpdate', player);
      return message.react('✅').catch((e) => {
        client.logger.error(e);
      });
    }
    return;
  }
};

export default ClearCommand;
