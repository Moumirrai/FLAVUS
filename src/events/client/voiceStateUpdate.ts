import { VoiceState, Permissions } from 'discord.js';
import { iEvent } from 'flavus';

const VoiceStateUpdateEvent: iEvent = {
  name: 'voiceStateUpdate',
  async execute(client, oldState: VoiceState, newState: VoiceState) {
    if (
      newState.channelId &&
      newState.channel.type === 'GUILD_STAGE_VOICE' &&
      newState.guild.me.voice.suppress
    ) {
      if (
        newState.guild.me.permissions.has(Permissions.FLAGS.SPEAK) ||
        (newState.channel &&
          newState.channel
            .permissionsFor(newState.guild.me)
            .has(Permissions.FLAGS.SPEAK))
      ) {
        newState.guild.me.voice.setSuppressed(false).catch();
      }
    }

    if (client.config.api && !newState.member.user.bot) {
      if (
        newState.channel &&
        newState.channel.type === 'GUILD_VOICE' &&
        newState.channel.members &&
        (newState.channel.members.filter((member) => !member.user.bot).size >
          0 ||
          (newState.channel.members.filter((member) => !member.user.bot).size >
            1 &&
            newState.member.user === client.user))
      ) {
        client.emit('handleConnectVoice', newState);
      } else {
        client.emit('handleDisconnectVoice', oldState);
      }
    }

    /**
     * Auto Leave Channel on EMPTY
     */

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

    if (newState.channelId && !oldState.channelId) {
      const player = client.manager.players.get(newState.guild.id);
      if (
        player &&
        newState.channel.members &&
        newState.channel.members.filter((mem) => !mem.user.bot).size >= 1
      ) {
        if (player.timeout) {
          player.timeout = null;
        }
      }
    }
  }
};

export default VoiceStateUpdateEvent;
