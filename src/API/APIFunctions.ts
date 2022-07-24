import { BotClient } from '../struct/Client';
import { MessageEmbed } from 'discord.js';
import type { Player } from 'erela.js';
import { Session, SessionData } from 'express-session';

export async function Connect(
  client: BotClient,
  session: Session & SessionData
): Promise<Player | null> {
  const voiceCache = client.APICache.voice.get(session.user.id);
  if (!voiceCache) return null;
  const title = client.config.anonymous
    ? 'Player initialized'
    : `Player initialized by <@${session.user.id}>`;
  const msg = await voiceCache.voiceChannel.send({
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
