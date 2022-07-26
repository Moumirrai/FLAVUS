import { BotClient } from '../struct/Client';
import { MessageEmbed } from 'discord.js';
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
  let channel
  if (guildModel && guildModel.statusChannel) channel = guildModel.statusChannel.id
  else channel = voiceCache.voiceChannel
  const title = client.config.anonymous
    ? 'Player initialized'
    : `Player initialized by <@${session.user.id}>`;
  const msg = await channel.send({
    embeds: [
      new MessageEmbed()
        .setColor(client.config.embed.color)
        .setTitle('Player initialized')
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
