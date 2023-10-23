import { Core } from '../../struct/Core';
import { EmbedBuilder, GuildTextBasedChannel } from 'discord.js';
import type { Player } from 'erela.js';
import { Session, SessionData } from 'express-session';
import { GuildModel, IGuildModel } from '../../models/guildModel';

export async function Connect(
  client: Core,
  session: Session & SessionData
): Promise<Player | null> {
  const voiceCache = client.apiClient.cache.voiceStates.get(session.user.id);
  if (!voiceCache) return null;
  //TODO: fix this
  const guildModel: IGuildModel = await GuildModel.findOne({
    guildID: voiceCache.guildId
  });
  let channel: GuildTextBasedChannel = voiceCache.voiceChannel;
  if (guildModel?.statusChannel?.id)
    channel = client.channels.cache.get(
      guildModel.statusChannel.id
    ) as GuildTextBasedChannel;
  const title = client.config.anonymous
    ? 'Player initialized'
    : `Player initialized by @${session.user.username}`;

  const msg = await channel.send({
    embeds: [
      new EmbedBuilder()
        .setColor(client.config.embed.color)
        .setTitle(title)
        .setTimestamp()
    ]
  });
  return await client.PlayerManager.connect(
    channel,
    client.manager,
    voiceCache.voiceChannel
  );
}
