import { BotClient } from '../struct/Client';
import { MessageEmbed, TextBasedChannel } from 'discord.js';
import type { Player } from 'erela.js';
import { Session, SessionData } from 'express-session';
import { GuildModel, IGuildModel } from '../models/guildModel';

export async function Connect(
  client: BotClient,
  session: Session & SessionData
): Promise<Player | null> {
  const voiceCache = client.APICache.voice.get(session.user.id);
  if (!voiceCache) return null;
  //TODO: fix this
  let guildModel: IGuildModel = await GuildModel.findOne({
    guildID: voiceCache.guildId
  });
  let channel: TextBasedChannel = voiceCache.voiceChannel;
  if (guildModel && guildModel.statusChannel && guildModel.statusChannel.id)
    channel = client.channels.cache.get(
      guildModel.statusChannel.id
    ) as TextBasedChannel;
  const title = client.config.anonymous
    ? 'Player initialized'
    : `Player initialized by @${session.user.username}`;

  const msg = await channel.send({
    embeds: [
      new MessageEmbed()
        .setColor(client.config.embed.color)
        .setTitle(title)
        .setTimestamp()
    ]
  });
  return await client.PlayerManager.connect(
    msg,
    client,
    client.manager,
    voiceCache.voiceChannel
  );
}
