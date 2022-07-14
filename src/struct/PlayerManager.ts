import { Client, Message, VoiceBasedChannel, User, MessageEmbed } from 'discord.js';
import { Manager, Player, SearchResult, Track } from 'erela.js';
import { socketResponse } from 'flavus';

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
    player.set('playerauthor', message.author.id);
  }
  return player;
}

export async function search(
  query: string,
  player: Player,
  author: User
): Promise<SearchResult> {
  let res: SearchResult;
  try {
    if (query.includes('open.spotify.com/') || validUrl.isUri(query)) {
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
      throw res.exception;
    }
  } catch (err) {
    console.log(err);
    throw err.message;
  }

  switch (res.loadType) {
    case 'NO_MATCHES':
      console.log('error101')
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

/*

export async function addToQueue(
  tracks: Track[],
  player: Player,
  author: User,
  client: Client,
  web: boolean,
  playlist?: boolean,
  ): Promise<MessageEmbed | socketResponse> {
  if (player.state !== 'CONNECTED') {
    player.set('playerauthor', author);
    player.connect();
    player.queue.add(tracks);
    player.play();
    player.pause(false);
    const embed = new MessageEmbed()
      .setColor(client.config.embed.color)
      .setTitle(`Now Playing`)
      .setDescription(
        `**[${res.tracks[0].title}](${res.tracks[0].uri})**`
      )
      .setThumbnail(res.tracks[0].thumbnail);
    return message.channel.send({
      embeds: [embed]
    });
  } else if (!player.queue || !player.queue.current) {
    player.queue.add(res.tracks[0]);
    if (!player.playing && !player.paused && !player.queue.size)
      player.play();
    player.pause(false);
    const embed = new MessageEmbed()
      .setColor(client.config.embed.color)
      .setTitle(`Now Playing`)
      .setDescription(
        `**[${res.tracks[0].title}](${res.tracks[0].uri})**`
      )
      .setThumbnail(res.tracks[0].thumbnail);
    return message.channel.send({
      embeds: [embed]
    });
  } else {
    player.queue.add(res.tracks[0]);
    return message.channel.send({
      embeds: [
        new MessageEmbed()
          .setColor(client.config.embed.color)
          .setTitle(`Queued`)
          .setDescription(
            `**[${res.tracks[0].title}](${res.tracks[0].uri})**`
          )
          .setThumbnail(res.tracks[0].thumbnail)
      ]
    });
  }
}
 */

