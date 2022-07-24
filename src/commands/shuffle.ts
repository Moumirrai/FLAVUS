import { CommandArgs, iCommand } from 'flavus';

const ShuffleCommand: iCommand = {
  name: 'shuffle',
  aliases: [],
  voiceRequired: true,
  joinPermissionRequired: false,
  playerRequired: true,
  sameChannelRequired: true,
  visible: true,
  description: 'Shuffles queue',
  usage: `<prefix>shuffle`,
  async execute({ message, player }: CommandArgs): Promise<any> {
    player.queue.shuffle();
    return message.react('🔀').catch((e) => {});
  }
};

export default ShuffleCommand;
