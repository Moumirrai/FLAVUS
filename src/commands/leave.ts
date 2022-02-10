import { CommandArgs, iCommand } from 'my-module';

const LeaveCommand: iCommand = {
  name: 'stop',
  aliases: ['ds', 'leave'],
  description: 'Resumes music if paused',
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
