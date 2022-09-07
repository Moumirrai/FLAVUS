import { CommandArgs, iCommand } from 'flavus';

const LeaveCommand: iCommand = {
  name: 'stop',
  aliases: ['ds', 'leave'],
  description: 'Stops player, and leaves the channel',
  usage: '<prefix>resume',
  voiceRequired: false,
  joinPermissionRequired: false,
  playerRequired: true,
  sameChannelRequired: false,
  visible: true,
  async execute({ client, message, player }: CommandArgs): Promise<any> {
    player.destroy();
    return message.react('🛑').catch((e) => {client.logger.error(e)});
  }
};

export default LeaveCommand;
