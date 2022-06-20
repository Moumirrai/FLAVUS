import { Socket } from 'socket.io';
import { BotClient } from '../struct/Client';
import { Message, MessageEmbed } from 'discord.js';
import type { Player } from 'erela.js';
import { Session, SessionData } from 'express-session';

export async function Connect(
  client: BotClient,
  session: Session & SessionData
): Promise<Player | null> {
  const voiceCache = client.voiceCache.get(session.user.id);
  if (!voiceCache) return null;
  const msg = await voiceCache.voiceChannel.send({
    embeds: [
      new MessageEmbed()
        .setColor(client.config.embed.color)
        .setTitle('Player initialized')
        .setTimestamp()
    ]
  });
  const player = await client.PlayerManager.connect(
    msg,
    client,
    client.manager,
    voiceCache.voiceChannel
  );
  return player;
}
