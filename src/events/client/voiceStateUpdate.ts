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
    /*
    if (
      newState.channelId &&
      newState.channel.type === 'GUILD_STAGE_VOICE' &&
      newState.guild.me.voice.suppress
    ) {
      if (
        newState.guild.client.user.
        newState.guild.me.permissions.has(PermissionFlagsBits.Speak) ||
        (newState.channel &&
          newState.channel
            .permissionsFor(newState.guild.me)
            .has(Permissions.FLAGS.SPEAK))
      ) {
        newState.guild.me.voice.setSuppressed(false).catch();
      }
    }
    */

    if (client.config.api && !newState.member.user.bot) {
      if (
        newState?.channel?.type === ChannelType.GuildVoice &&
        newState.channel?.members?.some((member) => !member.user.bot) &&
        newState.channel.members.has(newState.member.id)
      ) {
        handleConnectVoiceEvent(client, newState);
        //client.emit("handleConnectVoice", newState);
      } else {
        handleDisconnectVoiceEvent(client, newState);
      }
    }

    /**
     * Auto Leave Channel on EMPTY
     */

    /*
    if (
      oldState.channelId === newState.channelId ||
      (!oldState.channelId && !newState.channelId) ||
      (!newState.channelId && client.config.leaveOnEmptyChannel === null)
    ) {
      return;
    }
*/

    const oldChannelEmpty =
      oldState.channelId &&
      (!newState.channelId ||
        (oldState.channelId !== newState.channelId &&
          client.config.leaveOnEmptyChannel !== null) ||
        oldState.channel.members.filter((mem) => !mem.user.bot).size < 1);

    const newChannelNotEmpty =
      newState.channelId &&
      newState.channel.members &&
      newState.channel.members.filter((mem) => !mem.user.bot).size >= 1;

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

    /*
    if (
      (oldState.channelId && !newState.channelId) ||
      (newState.channelId &&
        oldState.channelId &&
        oldState.channelId !== newState.channelId &&
        client.config.leaveOnEmptyChannel !== null)
    ) {
      const player = client.manager.players.get(oldState.guild.id);
      if (
        player &&
        (!oldState.channel.members ||
          oldState.channel.members.size === 0 ||
          oldState.channel.members.filter((mem) => !mem.user.bot).size < 1)
      ) {
        if (player.timeout) return;
        player.timeout = setTimeout(async () => {
          client.logger.log('Stopping player, code 102');
          player.destroy();
        }, client.config.leaveOnEmptyChannel * 1000);
      }
    }

    if (newState.channelId) {
      const player = client.manager.players.get(newState.guild.id);
      if (
        player &&
        newState.channel.members &&
        newState.channel.members.filter((mem) => !mem.user.bot).size >= 1
      ) {
        if (player.timeout) {
          clearTimeout(player.timeout);
          player.timeout = null;
        }
      }
    }
    */
  }
};

export default VoiceStateUpdateEvent;
