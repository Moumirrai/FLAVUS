import {
  Message,
  VoiceBasedChannel,
  User,
  TextChannel,
  GuildTextBasedChannel,
  EmbedData
} from 'discord.js';
import { ResultHandlerInterface } from 'flavus-api';
import {
  Manager,
  Player,
  SearchResult,
  Track
} from 'magmastream';
import formatDuration from 'format-duration';
import { Core } from './Core';

import validUrl from 'valid-url';
import { PMError } from '../errors';

//TODO: move to @types/erela or somewhere else
interface searchParams {
  author?: User;
  handleResult?: boolean;
  web?: boolean;
}

export default class PlayerManager {
  private client: Core;

  constructor(client: Core) {
    this.client = client;
  }

  public async connect(
    textChannel: GuildTextBasedChannel,
    manager: Manager,
    vc: VoiceBasedChannel
  ): Promise<Player> {
    let player: Player = this.client.manager.players.get(textChannel.guild.id);
    //TODO: VOLUME DOES NOT WORK ATM
    //const doc = await this.client.functions.fetchGuildConfig(textChannel.guild.id);
    //if (!doc)
    //  this.client.logger.error('Something went wrong! - playerCreateEvent');
    if (!player) {
      player = manager.create({
        guild: textChannel.guild.id,
        voiceChannel: vc.id,
        textChannel: textChannel.id,
        selfDeafen: true
        //volume: doc.volume || 100,
      });
    }
    if (!player.node.connected) {
      player.node.connect();
    }
    return player;
  }

  public async search(
    query: string,
    player: Player,
    params: searchParams
  ): Promise<SearchResult | EmbedData> {
    const searchQuery =
      query.includes('open.spotify.com/') || validUrl.isUri(query)
        ? query
        : { query, source: "youtube" };
    const author = params.author || this.client.user;
    const res = await player.search(searchQuery, author);
    if (!params.handleResult) {
      return res;
    }
    return this.handleSearchResult(res, player, query) as SearchResult | EmbedData;
  }

  public async handleSearchResult(
    res: SearchResult,
    player: Player,
    query: string,
    web?: boolean
  ): Promise<EmbedData | ResultHandlerInterface> {
    const { loadType, tracks, playlist } = res;
    const querySubstring = query ? query.slice(0, 253) : 'unknown';
    const isQueryValidUrl = res.query && validUrl.isUri(res.query);
    switch (loadType) {
      case 'error':
        if (!player.queue.current) player.destroy();
        if (web) throw new PMError(res.loadType);

      case 'empty':
        if (!player.queue.current) player.destroy();
        if (web) throw `Found nothing for: \`${querySubstring}\``;
        return {
          title: `Found nothing for: \`${querySubstring}\``
        };
      case 'track':
      case 'search':
        //if res.query is valid url
        if (isQueryValidUrl) {
          const urlParams = new URL(res.query).searchParams;
          if (urlParams.has('t')) {
            const time = parseInt(urlParams.get('t')) * 1000;
            //if time is defined, is number and is between 0 and track duration, set startTime
            if (time >= 0 && time <= res.tracks[0].duration)
              res.tracks[0].startTime = time;
          }
        }

        if (player.state !== 'CONNECTED') {
          player.connect();
        }

        if (!player.queue.current) {
          player.queue.add(tracks[0]);
          await player.play(tracks[0]/*, {
            position: tracks[0].startTime || 0
          }*/);
          player.pause(false);
        } else {
          player.queue.add(tracks[0]);
        }
        this.client.emit('queueUpdate', player);
        if (web)
          return {
            type: 'TRACK',
            tracks: [
              {
                title: tracks[0].title,
                author: tracks[0].author,
                duration: tracks[0].duration,
                uri: tracks[0].uri
              }
            ],
            nowPlaying: true
          };
        return {
          author: {
            name: player.queue.length ? 'Added to queue' : 'Now playing'
          },
          title: `${tracks[0].title}`,
          url: tracks[0].uri,
          description: `by **${tracks[0].author}**`,
          thumbnail: { url: tracks[0].thumbnail || tracks[0].artworkUrl }
        };

      case 'playlist':
        if (player.state !== 'CONNECTED' || !player.queue.current) {
          if (player.state !== 'CONNECTED') player.connect();
          player.queue.add(playlist.tracks);
          await player.play();
          this.client.emit('queueUpdate', player);
          player.pause(false);
        } else {
          player.queue.add(playlist.tracks);
          this.client.emit('queueUpdate', player);
        }
        if (web)
          return {
            type: 'PLAYLIST',
            tracks: playlist.tracks.map((track) => ({
              title: track.title,
              author: track.author,
              duration: track.duration,
              uri: track.uri
            })),
            playlistName: playlist.name
          };
        return {
          author: { name: 'Queued' },
          title: `Playlist **\`${playlist.name.substring(0, 256 - 3)}\`**`,
          url: validUrl.isUri(res.query) ? res.query : playlist.tracks[0].uri,
          description: `by **${playlist.tracks[0].author}**`,
          thumbnail: { url: playlist.tracks[0].thumbnail || playlist.tracks[0].artworkUrl },
          fields: [
            {
              name: 'Duration: ',
              value: `\`${formatDuration(playlist.duration, {
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
        };
    }
  }

  public async autoplay(
    client: Core,
    player: Player,
    mode: string
  ): Promise<void | Message> {
    if (
      (player.get('previousTrack') as Track).requester !== client.user ||
      (player.get('similarQueue') as Track[])?.length === 0
    ) {
      if (mode === 'yt') {
        await this.ytAutoplay(client, player);
      } else if (mode === 'spotify') {
        //await this.spotifyAutoplay(client, player);
        await this.ytAutoplay(client, player);
      }
    }
    try {
      const similarQueue: Track[] = player.get('similarQueue');
      const track = similarQueue.splice(
        Math.floor(Math.random() * similarQueue.length),
        1
      )[0];
      player.set('similarQueue', similarQueue);
      player.queue.add(track);
      await client.embeds.message.info(
        client.channels.cache.get(player.textChannel) as TextChannel,
        {
          author: { name: 'Autoplay' },
          title: track.title,
          url: track.uri,
          description: `by **${track.author}**`,
          thumbnail: { url: track.thumbnail || track.artworkUrl }
        }
      );
      return player.play();
    } catch (e) {
      client.logger.error(e.stack);
    }
    return;
  }

  public async ytAutoplay(
    client: Core,
    player: Player
  ): Promise<void | Message> {
    try {
      const previoustrack: Track = player.get('previousTrack');
      if (!previoustrack) return;
      if (previoustrack.requester !== client.user)
        player.set('autoplayOwner', previoustrack.requester);

      const mixURL = `https://www.youtube.com/watch?v=${previoustrack.identifier}&list=RD${previoustrack.identifier}`;
      const response = await client.manager.search(mixURL, client.user);
      //if !response, send error embed
      if (!response || response.loadType !== 'playlist') {
        client.logger.error('Stopping player, code 107');
        player.destroy();
        return client.embeds.message.info(
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
      const filteredTracks = response.playlist.tracks.filter(
        (track) => track.identifier !== previoustrack.identifier
      );
      if (!filteredTracks.length) {
        client.logger.log('Stopping player, code 108');
        player.destroy();
        return client.embeds.message.info(
          client.channels.cache.get(player.textChannel) as TextChannel,
          {
            color: client.config.embed.color,
            title: 'Autoplay',
            description: 'No similar tracks found!'
          }
        );
      }
      player.set('similarQueue', filteredTracks);
    } catch (e) {
      client.logger.error(e.stack);
    }
    return;
  }
}
