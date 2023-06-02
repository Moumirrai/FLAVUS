import { Client, MessageEmbed, User } from 'discord.js';
import { Player, SearchResult } from 'erela.js';
import { GuildModel, IGuildModel } from '../models/guildModel';
import { UserModel } from '../models/userModel';
import Logger from './Logger';
import { config } from '../config/config';
import formatDuration from 'format-duration';

interface ITrackData {
  title: string;
  duration: number | string;
  uri: string;
}

const Functions = {
  /**
   * Escapes regex characters in a string
   * @returns {string}
   * @param str
   */
  escapeRegex(str: string): string {
    try {
      return str.replace(/[.*+?^$`{}()|[\]\\]/g, `\\$&`);
    } catch (e) {
      Logger.error(e.stack);
    }
  },

  /**
   * Creates a queue embed for given index
   * @returns {MessageEmbed} embed
   */
  createQueueEmbed(
    player: Player,
    index: number,
    client: Client
  ): MessageEmbed {
    const tracks = player.queue;
    const tDuration = tracks.reduce(
      (acc, track) => {
        acc.duration += track.isStream ? 0 : track.duration;
        acc.stream += track.isStream ? 1 : 0;
        return acc;
      },
      { duration: 0, stream: 0 }
    );
    if (player.queue.current) {
      if (player.queue.current.isStream) {
        tDuration.stream++;
      } else {
        tDuration.duration += player.queue.current.duration - player.position;
      }
    }
    const queueLength = tracks.length
      ? `  -  ${tracks.length} ${tracks.length === 1 ? 'Track' : 'Tracks'}`
      : '';
    const totalDuration =
      tDuration.duration || tDuration.stream
        ? `\n\nTotal length - \`${formatDuration(tDuration.duration, {
            leading: true
          })}\`${tDuration.stream ? ` + \`${tDuration.stream}\` Streams` : ''}`
        : '';
    const embed = new MessageEmbed()
      .setTitle(
        `Queue${queueLength}${player.trackRepeat ? '  -  LOOP ENABLED' : ''}`
      )
      .setColor(config.embed.color);

    let description = '';

    if (player.queue.current) {
      const title =
        tracks.current.title.length > 37
          ? this.escapeRegex(tracks.current.title.substr(0, 37)) + '...'
          : this.escapeRegex(tracks.current.title);
      const npLine =
        `**Now Playing - [${title}](${tracks.current.uri})**\n` +
        `${
          tracks.current.isStream
            ? '[:red_circle: LIVE STREAM]'
            : this.createProgressBar(player)
        }\n`;
      description += npLine;
    }

    let tracksData: Array<ITrackData> = tracks.map(track => ({
      title:
        track.title.length > 37
          ? `${this.escapeRegex(track.title.substr(0, 37))}...`
          : this.escapeRegex(track.title),
      duration: track.isStream
        ? `LIVE STREAM`
        : formatDuration(track.duration, { leading: true }),
      uri: track.uri
    }));

    const page = Math.ceil((index + 15) / 15);
    const endOfQueue =
      page === Math.ceil(tracks.length / 15)
        ? '\nThis is the end of the queue!\n\nUse ' +
          client.config.prefix +
          'play to add more :^)'
        : '';
    description +=
      `\n` +
      tracksData
        .slice(index, index + 15)
        .map(
          (track, index) =>
            `**${index + 1})** [${track.title}](${track.uri}) - [${
              track.duration
            }]\n`
        )
        .join('') +
      totalDuration +
      endOfQueue;

    return embed
      .setDescription(description)
      .setFooter({
        text: `Page ${page} of ${Math.ceil(tracks.length / 15)}`
      })
      .setThumbnail(
        player.queue.current
          ? player.queue.current.thumbnail
          : tracks.current.thumbnail
      );
  },

  /**
   * Create a progress bar for the current track
   * @returns {string} progress bar
   */
  createProgressBar(player: Player): string {
    const { size, arrow, block } = config.embed.progress_bar;
    if (!player.queue.current) return '';
    const current =
      player.queue.current.duration !== 0
        ? player.position
        : player.queue.current.duration;
    const total = player.queue.current.duration;
    const progress = Math.round((size * current) / total);
    const emptyProgress = size - progress;
    const progressString =
      block.repeat(progress) + arrow + block.repeat(emptyProgress);
    const times = `${
      new Date(player.position).toISOString().substr(11, 8) +
      ' / ' +
      (player.queue.current.duration === 0
        ? ' ◉ LIVE'
        : new Date(player.queue.current.duration).toISOString().substr(11, 8))
    }`;
    return `[${progressString}][${times}]`;
  },

  /**
   * Fetches a guild's config from mongodb
   * @param {string} guildID - guild id
   * @returns {Promise<IGuildModel>} GuildModel
   */
  async fetchGuildConfig(guildID: string): Promise<IGuildModel | null> {
    try {
      const doc = await GuildModel.findOne({ guildID }).exec();
      if (doc) return doc;
      return new GuildModel({
        guildID
      }).save();
    } catch (err) {
      Logger.error(err);
      return null;
    }
  },

  /**
   * If enabled, filters out tracks from autoplay search according to the user's config
   * @returns {Promise<SearchResult>} filtered response
   */
  //TODO: refactor this
  async blacklist(
    client: Client,
    player: Player,
    response: SearchResult
  ): Promise<SearchResult> {
    const owner: User = player.get(`autoplayOwner`);
    if (owner) {
      const userConfig = await UserModel.findOne({
        userID: owner.id
      });
      if (userConfig && userConfig.model.blacklist === true) {
        //filter tracks
        if (userConfig.model.titleBlacklist.length > 0) {
          response.tracks.forEach((track) => {
            const titles = track.title.split(client.config.split);
            for (const title of titles) {
              if (userConfig.model.titleBlacklist.includes(title)) {
                response.tracks.splice(response.tracks.indexOf(track), 1);
                break;
              }
            }
          });
        }
        //filter author
        if (userConfig.model.authorBlacklist.length > 0) {
          userConfig.model.authorBlacklist =
            userConfig.model.authorBlacklist.map((x) => x.toLowerCase());
          response.tracks = response.tracks.filter((track) => {
            const authors = track.author.toLowerCase().split(' ');
            for (const author of authors) {
              if (userConfig.model.authorBlacklist.includes(author)) {
                return false;
              }
            }
            return true;
          });
        }
        //filter uri
        if (userConfig.model.uriBlacklist.length > 0) {
          response.tracks = response.tracks.filter((track) => {
            return !userConfig.model.uriBlacklist.includes(track.uri);
          });
        }
      }
    }
    return response;
  }
};

export default Functions;
