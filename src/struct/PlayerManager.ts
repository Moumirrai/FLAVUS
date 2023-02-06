import {
  Client,
  Message,
  VoiceBasedChannel,
  User,
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
    if (!player) {
      player = manager.create({
        guild: message.guild.id,
        voiceChannel: vc.id,
        textChannel: message.channel.id,
        selfDeafen: true
      });
    }
    if (!player.node.connected) {
      player.node.connect();
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
      res = await player.search(
        query.includes('open.spotify.com/') || validUrl.isUri(query)
          ? query
          : { query: query, source: 'youtube' },
        author
      );
      if (res.loadType === 'LOAD_FAILED') {
        throw { message: res.exception };
      }
    } catch (err) {
      throw err;
    }
    res.query = query;
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
        if (!player.queue.current) {
          client.logger.log('Stopping player, code 106');
          player.destroy();
        }
        if (web)
          throw `Found nothing for: \`${
            res.query ? res.query.substring(0, 253) : 'unknown'
          }\``;
        return client.embeds.build(
          {
            title: `Found nothing for: \`${
              res.query ? res.query.substring(0, 253) : 'unknown'
            }\``
          },
          true
        );
      case 'TRACK_LOADED':
      case 'SEARCH_RESULT':
        //if res.query is valid url
        if (res.query && validUrl.isUri(res.query)) {
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
          client.emit('queueUpdate', player);
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
          return client.embeds.build({
            author: { name: 'Now Playing' },
            title: `${res.tracks[0].title}`,
            url: res.tracks[0].uri,
            description: `by **${res.tracks[0].author}**`,
            thumbnail: { url: res.tracks[0].thumbnail }
          });
        } else {
          player.queue.add(res.tracks[0]);
          client.emit('queueUpdate', player);
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
          return client.embeds.build({
            author: { name: 'Queued' },
            title: `${res.tracks[0].title}`,
            url: res.tracks[0].uri,
            description: `by **${res.tracks[0].author}**`,
            thumbnail: { url: res.tracks[0].thumbnail }
          });
        }
      case 'PLAYLIST_LOADED':
        if (player.state !== 'CONNECTED' || !player.queue.current) {
          if (player.state !== 'CONNECTED') player.connect();
          player.queue.add(res.tracks);
          await player.play();
          client.emit('queueUpdate', player);
          player.pause(false);
        } else {
          player.queue.add(res.tracks);
          client.emit('queueUpdate', player);
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
        return client.embeds.build(
          {
            author: { name: 'Queued' },
            title: `Playlist **\`${res.playlist.name.substring(
              0,
              256 - 3
            )}\`**`,
            url: res.tracks[0].uri,
            description: `by **${res.tracks[0].author}**`,
            thumbnail: { url: res.tracks[0].thumbnail },
            fields: [
              {
                name: 'Duration: ',
                value: `\`${formatDuration(res.playlist.duration, {
                  leading: true
                })}\``,
                inline: true
              },
              {
                name: 'Queue length: ',
                value: `\`${player.queue.length} Songs\``,
                inline: true
              }
            ]
          },
          true
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
      await client.embeds.info(
        client.channels.cache.get(player.textChannel) as TextChannel,
        {
          author: { name: 'Autoplay' },
          title: track.title,
          url: track.uri,
          description: `by **${track.author}**`,
          thumbnail: { url: track.thumbnail }
        }
      );
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
      const response = await client.manager.search(mixURL, client.user);
      //if !response, send error embed
      if (!response || response.loadType !== 'PLAYLIST_LOADED') {
        client.logger.log('Stopping player, code 107');
        player.destroy();
        return client.embeds.info(
          client.channels.cache.get(player.textChannel) as TextChannel,
          {
            color: client.config.embed.color,
            author: { name: 'Autoplay' },
            title: 'No similar tracks found!'
          }
        );
      }
      //TODO: Fix blacklist
      /*
      response.tracks = (
        await client.functions.blacklist(client, player, response)
      ).tracks;

      const filteredTracks = (await client.functions.blacklist(client, player, response)).tracks.filter(track => track.identifier !== previoustrack.identifier);
      */
      //remove previous track from tracks
      const filteredTracks = response.tracks.filter(
        (track) => track.identifier !== previoustrack.identifier
      );
      if (!filteredTracks.length) {
        client.logger.log('Stopping player, code 108');
        player.destroy();
        return client.embeds.info(
          client.channels.cache.get(player.textChannel) as TextChannel,
          {
            color: client.config.embed.color,
            title: 'Autoplay',
            description: 'No similar tracks found!'
          }
        );
      }
      player.set(`similarQueue`, filteredTracks);
    } catch (e) {
      client.logger.error(e.stack);
    }
    return;
  }

  public static async spotifyAutoplay(client: Core, player: Player) {
    try {
      const previoustrack: Track = player.get(`previousTrack`);
      if (!previoustrack) return;
      if (previoustrack.requester !== client.user)
        player.set(`autoplayOwner`, previoustrack.requester);

      //find previous track on spotify
      const resolver = (client.manager.options.plugins[0] as Spotify).resolver;

      const sourceTrack = (await resolver.makeRequest(
        `https://api.spotify.com/v1/search?q=${encodeURI(
          previoustrack.title
        )}&type=track&limit=1&offset=0`
      )) as iSpotifySearchResult;

      if (!sourceTrack.tracks.items.length) {
        client.logger.log('Stopping player, code 109');
        player.destroy();
        return client.embeds.info(
          client.channels.cache.get(player.textChannel) as TextChannel,
          {
            color: client.config.embed.color,
            title: 'Autoplay',
            description: 'No similar tracks found!'
          }
        );
      }

      const recomm = (await (
        client.manager.options.plugins[0] as Spotify
      ).resolver.makeRequest(
        `https://api.spotify.com/v1/recommendations?limit=15&seed_artists=${sourceTrack.tracks.items[0].artists[0].id}&seed_tracks=${sourceTrack.tracks.items[0].id}`
      )) as iSpotifyRecommResult;
      if (!recomm.tracks.length) {
        client.logger.log('Stopping player, code 110');
        player.destroy();
        return client.embeds.info(
          client.channels.cache.get(player.textChannel) as TextChannel,
          {
            color: client.config.embed.color,
            title: 'Autoplay',
            description: 'No similar tracks found!'
          }
        );
      }
      //fiter out all track that has type other than "track" and add them to array
      const tracks = recomm.tracks.filter(
        (track) => track.type === 'track'
      ) as SpotifyTrack[];
      //now for each track
      const similarQueue: Track[] = [];
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
