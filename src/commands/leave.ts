import { MessageReaction } from 'discord.js';
import { CommandArgs, iCommand } from 'flavus';

const LeaveCommand: iCommand = {
  name: 'stop',
  aliases: ['ds', 'leave'],
  description: 'Stops player, and leaves the channel',
  usage: '<prefix>resume',
  playerRequired: true,
  visible: true,
  async execute({ client, message, player }: CommandArgs) {
    client.logger.log('Stopping player, code 102');
    player.destroy();
    return message.react('🛑').catch((e) => {
      client.logger.error(e);
    });
  }
};

export default LeaveCommand;
