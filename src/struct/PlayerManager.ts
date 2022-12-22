import {
  Client,
  Message,
  VoiceBasedChannel,
  User,
  MessageEmbed,
  MessageOptions,
  TextChannel
} from 'discord.js';
import { ResultHandlerInterface } from 'flavus-api';
import {
  Manager,
  Player,
  SearchResult,
  Track,
  UnresolvedTrack,
  TrackUtils
} from 'erela.js';
import formatDuration = require('format-duration');
import { Core } from './Core';
import { Spotify } from 'better-erela.js-spotify/dist/plugin';
import { SpotifyTrack } from 'better-erela.js-spotify/dist/typings';
import { BaseManager } from 'better-erela.js-spotify/dist/Manager/BaseManager';
import { iSpotifySearchResult, iSpotifyRecommResult } from 'flavus';

import validUrl = require('valid-url');

export default class PlayerManager {
  public static async connect(
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
    return player;
  }

  public static async search(
    query: string,
    player: Player,
    author: User,
    yt?: boolean
  ): Promise<SearchResult> {
    let res: SearchResult;
    try {
      if (
        (!yt && query.includes('open.spotify.com/')) ||
        validUrl.isUri(query)
      ) {
        res = await player.search(query, author);
        res.query = query;
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
    return res;
  }

  public static async handleSearchResult(
    client: Core,
    res: SearchResult,
    player: Player,
    web?: boolean
  ): Promise<MessageOptions | ResultHandlerInterface> {
    switch (res.loadType) {
      case 'NO_MATCHES':
        if (!player.queue.current) player.destroy();
        if (web)
          throw String(
            'Found nothing for: ' + res.query ? res.query : 'unknown'
          ).substring(0, 253);
        return client.embeds.error(
          String(
            'Found nothing for: `' + res.query ? res.query : 'unknown'
          ).substring(0, 253) + '`'
        );
      case 'TRACK_LOADED':
      case 'SEARCH_RESULT':
        if (res.query) {
          const urlParams = new URL(res.query).searchParams;
          if (urlParams.has('t')) {
            const time = parseInt(urlParams.get('t')) * 1000;
            if (
              !time ||
              isNaN(time) ||
              time < 0 ||
              time > res.tracks[0].duration
            )
              return;
            res.tracks[0].startTime = time;
          }
        }
        if (player.state !== 'CONNECTED' || !player.queue.current) {
          if (player.state !== 'CONNECTED') player.connect();
          player.queue.add(res.tracks[0]);
          await player.play(res.tracks[0], {
            startTime: res.tracks[0].startTime ? res.tracks[0].startTime : 0
          });
          player.pause(false);
          if (web)
            return {
              type: 'TRACK',
              tracks: [
                {
                  title: res.tracks[0].title,
                  author: res.tracks[0].author,
                  duration: res.tracks[0].duration,
                  uri: res.tracks[0].uri
                }
              ],
              nowPlaying: true
            };
          return client.embeds.message(
            new MessageEmbed()
              .setAuthor({ name: 'Now Playing' })
              .setTitle(`${res.tracks[0].title}`)
              .setURL(res.tracks[0].uri)
              .setDescription(`by **${res.tracks[0].author}**`)
              .setThumbnail(res.tracks[0].thumbnail)
          );
        } else {
          player.queue.add(res.tracks[0]);
          if (web)
            return {
              type: 'TRACK',
              tracks: [
                {
                  title: res.tracks[0].title,
                  author: res.tracks[0].author,
                  duration: res.tracks[0].duration,
                  uri: res.tracks[0].uri
                }
              ],
              nowPlaying: true
            };
          return client.embeds.message(
            new MessageEmbed()
              .setAuthor({ name: 'Queued' })
              .setTitle(`${res.tracks[0].title}`)
              .setURL(res.tracks[0].uri)
              .setDescription(`by **${res.tracks[0].author}**`)
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
        if (web)
          return {
            type: 'PLAYLIST',
            tracks: res.tracks.map((track) => ({
              title: track.title,
              author: track.author,
              duration: track.duration,
              uri: track.uri
            })),
            playlistName: res.playlist.name
          };
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
            .addField(
              'Queue length: ',
              `\`${player.queue.length} Songs\``,
              true
            )
        );
    }
  }

  public static async autoplay(
    client: Core,
    player: Player,
    mode: string
  ): Promise<void | Message> {
    if (
      (player.get(`previousTrack`) as Track).requester !== client.user ||
      !player.get(`similarQueue`) ||
      (player.get(`similarQueue`) as Track[]).length === 0
    ) {
      if (mode === 'yt') {
        await this.ytAutoplay(client, player);
      } else if (mode === 'spotify') {
        await this.spotifyAutoplay(client, player);
      }
    }
    try {
      const similarQueue: Track[] = player.get(`similarQueue`);
      const track = similarQueue.splice(
        Math.floor(Math.random() * similarQueue.length),
        1
      )[0];
      player.set(`similarQueue`, similarQueue);
      player.queue.add(track);
      const embed = new MessageEmbed()
        .setAuthor({ name: 'Autoplay' })
        .setTitle(`${track.title}`)
        .setURL(track.uri)
        .setDescription(`by **${track.author}**`)
        .setColor(client.config.embed.color)
        .setThumbnail(track.thumbnail);
      (client.channels.cache.get(player.textChannel) as TextChannel)
        .send({ embeds: [embed] })
        .catch(() => {});
      return player.play();
    } catch (e) {
      client.logger.error(e.stack);
    }
    return;
  }

  public static async ytAutoplay(
    client: Core,
    player: Player
  ): Promise<void | Message> {
    try {
      const previoustrack: Track = player.get(`previousTrack`);
      if (!previoustrack) return;
      //update owner
      if (previoustrack.requester !== client.user)
        player.set(`autoplayOwner`, previoustrack.requester);

      const mixURL = `https://www.youtube.com/watch?v=${previoustrack.identifier}&list=RD${previoustrack.identifier}`;
      const response: SearchResult = await client.manager.search(
        mixURL,
        client.user
      );
      //if !response, send error embed
      if (
        !response ||
        response.loadType === 'LOAD_FAILED' ||
        response.loadType !== 'PLAYLIST_LOADED'
      ) {
        player.destroy();
        return (client.channels.cache.get(player.textChannel) as TextChannel)
          .send({
            embeds: [
              new MessageEmbed()
                .setColor(client.config.embed.color)
                .setAuthor({ name: 'Autoplay' })
                .setTitle('No similar tracks found!')
            ]
          })
          .catch((e) => {
            client.logger.error(e);
          });
      }
      response.tracks = (
        await client.functions.blacklist(client, player, response)
      ).tracks;
      //remove previous track from tracks, if present
      response.tracks = response.tracks.filter(
        (track) => track.identifier !== previoustrack.identifier
      );
      //if there are no tracks left in the response, send error message
      if (!response.tracks.length) {
        player.destroy();
        return (client.channels.cache.get(player.textChannel) as TextChannel)
          .send({
            embeds: [
              new MessageEmbed()
                .setColor(client.config.embed.color)
                .setTitle('Autoplay')
                .setDescription('No similar tracks found!')
            ]
          })
          .catch(() => {});
      }
      player.set(`similarQueue`, response.tracks); //set the similar queue
    } catch (e) {
      client.logger.error(e.stack);
    }
    return;
  }

  public static async spotifyAutoplay(client: Core, player: Player) {
    try {
      const previoustrack: Track = player.get(`previousTrack`);
      if (!previoustrack) return;
      //update owner
      if (previoustrack.requester !== client.user)
        player.set(`autoplayOwner`, previoustrack.requester);
      //find previous track on spotify
      let sourceTrack = (await (
        client.manager.options.plugins[0] as Spotify
      ).resolver.makeRequest(
        `https://api.spotify.com/v1/search?q=${encodeURI(
          previoustrack.title
        )}&type=track&limit=1&offset=0`
      )) as iSpotifySearchResult;
      if (!sourceTrack.tracks.items.length) {
        player.destroy();
        return (client.channels.cache.get(player.textChannel) as TextChannel)
          .send({
            embeds: [
              new MessageEmbed()
                .setColor(client.config.embed.color)
                .setTitle('Autoplay')
                .setDescription('No similar tracks found!')
            ]
          })
          .catch(() => {});
      }
      let recomm = (await (
        client.manager.options.plugins[0] as Spotify
      ).resolver.makeRequest(
        `https://api.spotify.com/v1/recommendations?limit=15&seed_artists=${sourceTrack.tracks.items[0].artists[0].id}&seed_tracks=${sourceTrack.tracks.items[0].id}`
      )) as iSpotifyRecommResult;
      if (!recomm.tracks.length) {
        player.destroy();
        return (client.channels.cache.get(player.textChannel) as TextChannel)
          .send({
            embeds: [
              new MessageEmbed()
                .setColor(client.config.embed.color)
                .setTitle('Autoplay')
                .setDescription('No similar tracks found!')
            ]
          })
          .catch(() => {});
      }
      //fiter out all track that has type other than "track" and add them to array
      let tracks = recomm.tracks.filter(
        (track) => track.type === 'track'
      ) as SpotifyTrack[];
      //now for each track
      let similarQueue: Track[] = [];
      for (let i = 0; i < tracks.length; i++) {
        similarQueue.push(
          TrackUtils.buildUnresolved(
            this.spotifyBuildUnresolved(tracks[i], client)
          ) as Track
        );
      }
      player.set(`similarQueue`, similarQueue);
    } catch (e) {
      client.logger.error(e.stack);
    }
  }

  public static spotifyBuildUnresolved(
    track: SpotifyTrack,
    client
  ): Omit<UnresolvedTrack, 'resolve'> {
    return {
      requester: client.user,
      title: track.name,
      duration: track.duration_ms,
      thumbnail: (track as SpotifyTrack).album?.images[0]
        ? (track as SpotifyTrack).album?.images[0].url
        : null,
      uri: track.external_urls.spotify,
      author: Array.isArray((track as SpotifyTrack).artists)
        ? (track as SpotifyTrack).artists
            .map((artist) => artist.name)
            .join(', ')
        : ' '
    };
  }
}
