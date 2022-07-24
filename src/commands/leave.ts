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
  async execute({ message, player }: CommandArgs): Promise<any> {
    player.destroy();
    return message.react('🛑').catch((e) => {});
  }
};

export default LeaveCommand;
