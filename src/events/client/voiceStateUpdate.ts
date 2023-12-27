import { VoiceState, PermissionFlagsBits, ChannelType } from 'discord.js';
import { iEvent } from 'flavus';
import { Events } from 'discord.js';
import {
  handleConnectVoiceEvent,
  handleDisconnectVoiceEvent
} from '../../handlers';

const VoiceStateUpdateEvent: iEvent = {
  name: Events.VoiceStateUpdate,
  execute(client, oldState: VoiceState, newState: VoiceState) {
    if (newState.member.user.bot || oldState.member.user.bot) return;

    if (client.config.api && !newState.member.user.bot) {
      if (
        newState?.channel?.type === ChannelType.GuildVoice &&
        newState.channel?.members?.some((member) => !member.user.bot) &&
        newState.channel.members.has(newState.member.id)
      ) {
        handleConnectVoiceEvent(client, newState);
      } else {
        handleDisconnectVoiceEvent(client, newState);
      }
    }

    /**
     * Auto Leave Channel on EMPTY
     */

    const oldChannelEmpty =
      oldState.channelId &&
      (!newState.channelId ||
        (oldState.channelId !== newState.channelId &&
          client.config.leaveOnEmptyChannel !== null) ||
        oldState.channel.members.filter(
          (mem) => !mem.user.bot && !mem.voice.selfMute
        ).size <= 1);

    const newChannelNotEmpty =
      newState.channelId &&
      newState.channel.members &&
      newState.channel.members.filter(
        (mem) => !mem.user.bot && !mem.voice.selfMute
      ).size >= 1;

    if (oldChannelEmpty) {
      const player = client.manager.players.get(oldState.guild.id);
      if (player && !player.timeout) {
        player.timeout = setTimeout(() => {
          client.logger.log('Stopping player, code 102');
          player.destroy();
        }, client.config.leaveOnEmptyChannel * 1000);
      }
    } else if (newChannelNotEmpty) {
      const player = client.manager.players.get(newState.guild.id);
      if (player && player.timeout) {
        clearTimeout(player.timeout);
        player.timeout = null;
      }
    }
  }
};

export default VoiceStateUpdateEvent;
