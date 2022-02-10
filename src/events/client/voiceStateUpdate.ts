import {
  TextChannel,
  VoiceState,
  Permissions,
  VoiceBasedChannel
} from 'discord.js';
import { iEvent } from 'my-module';

//TODO: Fix this mess!!!

const VoiceStateUpdateEvent: iEvent = {
  name: 'voiceStateUpdate',
  async execute(client, oldState: VoiceState, newState: VoiceState) {
    if (
      newState.channelId &&
      newState.channel.type == 'GUILD_STAGE_VOICE' &&
      newState.guild.me.voice.suppress
    ) {
      if (
        newState.guild.me.permissions.has(Permissions.FLAGS.SPEAK) ||
        (newState.channel &&
          newState.channel
            .permissionsFor(newState.guild.me)
            .has(Permissions.FLAGS.SPEAK))
      ) {
        newState.guild.me.voice.setSuppressed(false).catch(() => {});
      }
    }

    /**
     * Auto Leave Channel on EMPTY OR EVERYONE IS DEAFED!
     */
    if (oldState.channelId && (!newState.channelId || newState.channelId)) {
      var player = client.manager.players.get(newState.guild.id);
      if (player && oldState.channelId == player.voiceChannel) {
        //as long as it's the right voice State
        if (
          !(
            (!oldState.streaming && newState.streaming) ||
            (oldState.streaming && !newState.streaming) ||
            (!oldState.serverMute &&
              newState.serverMute &&
              !newState.serverDeaf &&
              !newState.selfDeaf) ||
            (oldState.serverMute &&
              !newState.serverMute &&
              !newState.serverDeaf &&
              !newState.selfDeaf) ||
            (!oldState.selfMute &&
              newState.selfMute &&
              !newState.serverDeaf &&
              !newState.selfDeaf) ||
            (oldState.selfMute &&
              !newState.selfMute &&
              !newState.serverDeaf &&
              !newState.selfDeaf) ||
            (!oldState.selfVideo && newState.selfVideo) ||
            (oldState.selfVideo && !newState.selfVideo)
          )
        ) {
          //if player exist, but not connected or channel got empty (for no bots)
          if (
            client.config.leaveOnEmptyChannel !== null &&
            player &&
            (!oldState.channel.members ||
              oldState.channel.members.size == 0 ||
              oldState.channel.members.filter(
                (mem) => !mem.user.bot && !mem.voice.deaf && !mem.voice.selfDeaf
              ).size < 1)
          ) {
            setTimeout(async () => {
              try {
                let vc: any = newState.guild.channels.cache.get(
                  player.voiceChannel
                );
                if (vc) vc = await vc.fetch();
                if (!vc)
                  vc =
                    (await newState.guild.channels
                      .fetch(player.voiceChannel)
                      .catch(() => {})) || false;
                if (!vc) return player.destroy();
                if (
                  !vc.members ||
                  vc.members.size == 0 ||
                  vc.members.filter(
                    (mem) =>
                      !mem.user.bot && !mem.voice.deaf && !mem.voice.selfDeaf
                  ).size < 1
                ) {
                  player.destroy();
                }
              } catch (e) {
                console.log(e);
              }
            }, parseInt(client.config.leaveOnEmptyChannel) * 1000);
          }
        }
      }
    }
  }
};

export default VoiceStateUpdateEvent;
