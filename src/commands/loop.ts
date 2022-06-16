import { Message, MessageEmbed, MessageReaction, ReactionEmoji } from 'discord.js';
import { CommandArgs, iCommand } from 'flavus';

const PauseCommand: iCommand = {
  name: 'loop',
  aliases: ['ll', 'lo'],
  voiceRequired: true,
  joinPermissionRequired: false,
  playerRequired: true,
  sameChannelRequired: true,
  visible: true,
  description: 'TODO',
  usage: '<prefix>loop',
  async execute({ client, message, player }: CommandArgs): Promise<MessageReaction | void> {
    if (!player.trackRepeat) {
      player.setTrackRepeat(true);
      return message.react('🔂').catch((e) => {});
    }
    player.setTrackRepeat(false);
    message.react('❌').catch((e) => {});
  }
};

export default PauseCommand;
