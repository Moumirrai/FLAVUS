import {
  Client,
  Message,
  VoiceBasedChannel,
  User,
  MessageEmbed, MessageOptions
} from 'discord.js';
import { Manager, Player, SearchResult, Track } from 'erela.js';
import formatDuration = require('format-duration');
import { BotClient } from './Client';

const validUrl = require('valid-url');

export async function connect(
  message: Message,
  client: Client,
  manager: Manager,
  vc: VoiceBasedChannel
): Promise<Player> {
  let player: Player = client.manager.players.get(message.guild.id);
  if (player && player.node && !player.node.connected)
    await player.node.connect();
  if (!player) {
    player = await manager.create({
      guild: message.guild.id,
      voiceChannel: vc.id,
      textChannel: message.channel.id,
      selfDeafen: true
    });
    if (player && player.node && !player.node.connected)
      await player.node.connect();
  }
  if (player.state !== 'CONNECTED') {
  }
  return player;
}

export async function search(
  query: string,
  player: Player,
  author: User,
  yt?: boolean
): Promise<SearchResult> {
  let res: SearchResult;
  try {
    if (!yt && query.includes('open.spotify.com/') || validUrl.isUri(query)) {
      res = await player.search(query, author);
    } else {
      res = await player.search(
        {
          query: query,
          source: 'youtube'
        },
        author
      );
    }
    if (res.loadType === 'LOAD_FAILED') {
      throw { message: res.exception };
    }
  } catch (err) {
    throw err;
  }

  switch (res.loadType) {
    case 'NO_MATCHES':
      if (!player.queue.current) player.destroy();
      throw 'No matches found!';
    case 'TRACK_LOADED':
    case 'SEARCH_RESULT':
    case 'PLAYLIST_LOADED':
      return res;
    default:
      throw 'Unknown load type!';
  }
}

export async function handleSearchResult(
  client: BotClient,
  res: SearchResult,
  player: Player,
  web?: boolean
): Promise<MessageOptions|string> {
  switch (res.loadType) {
    case 'NO_MATCHES':
      if (web) throw String('Found nothing for: ' + search).substring(0, 253);
      return client.embeds.error(
        String('Found nothing for: **`' + search).substring(0, 253) + '`**'
      );
    case 'TRACK_LOADED':
    case 'SEARCH_RESULT':
      if (player.state !== 'CONNECTED' || !player.queue.current) {
        if (player.state !== 'CONNECTED') player.connect();
        player.queue.add(res.tracks[0]);
        await player.play();
        player.pause(false);
        if (web)
          return `Now Playing\n[${res.tracks[0].title}](${res.tracks[0].uri})`;
        return client.embeds.message(
          new MessageEmbed()
            .setTitle(`Now Playing`)
            .setDescription(
              `**[${res.tracks[0].title}](${res.tracks[0].uri})**`
            )
            .setThumbnail(res.tracks[0].thumbnail)
        );
      } else {
        player.queue.add(res.tracks[0]);
        if (web)
          return (
            String(res.tracks[0].title).substring(0, 253) + '\nadded to queue'
          );
        return client.embeds.message(
          new MessageEmbed()
            .setTitle('Queued')
            .setDescription(
              `**[${res.tracks[0].title}](${res.tracks[0].uri})**`
            )
            .setThumbnail(res.tracks[0].thumbnail)
        );
      }
    case 'PLAYLIST_LOADED':
      if (player.state !== 'CONNECTED' || !player.queue.current) {
        if (player.state !== 'CONNECTED') player.connect();
        player.queue.add(res.tracks);
        await player.play();
        player.pause(false);
      } else {
        player.queue.add(res.tracks);
      }
      if (web) return 'TODO';
      return client.embeds.message(
        new MessageEmbed()
          .setTitle(
            `Playlist  **\`${res.playlist.name}`.substr(0, 256 - 3) +
              '`**' +
              ' added to the Queue'
          )
          .setThumbnail(res.tracks[0].thumbnail)
          .addField(
            'Duration: ',
            `\`${formatDuration(res.playlist.duration, {
              leading: true
            })}\``,
            true
          )
          .addField('Queue length: ', `\`${player.queue.length} Songs\``, true)
      );
  }
}