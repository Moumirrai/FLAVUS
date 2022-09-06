import {
  Client,
  ColorResolvable,
  Message,
  MessageEmbed,
  TextChannel,
  User
} from 'discord.js';
import { Player, Track, SearchResult } from 'erela.js';
import { GuildModel, IGuildModel } from '../models/guildModel';
import { UserModel } from '../models/userModel';
import Logger from './Logger';
import { config } from '../config/config';
import formatDuration from 'format-duration';

//TODO: probably useless, check and remove
export function random<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}
/**
 * Creates a queue embed for given index
 * @returns {MessageEmbed} embed
 */
export function createQueueEmbed(
  player: Player,
  index: number,
  client: Client
): MessageEmbed {
  const tracks = player.queue;
  let tDuration = { duration: 0, stream: 0 };
  tracks.forEach((track) => {
    if (!track.isStream) tDuration.duration += track.duration;
    else tDuration.stream++;
  });
  if (player.queue.current && player.queue.current.isStream) tDuration.stream++;
  else if (player.queue.current) {
    let current =
      player.queue.current.duration !== 0
        ? player.position
        : player.queue.current.duration;
    let total = player.queue.current.duration;
    tDuration.duration += total - current;
  }
  let queueLength;
  if (tracks.length === 0) {
    queueLength = '';
  } else if (tracks.length === 1) {
    queueLength = '  -  1 Track';
  } else {
    queueLength = `  -  ${tracks.length} Tracks`;
  }
  let totalDuration = '';
  if (tDuration.duration !== 0 || tDuration.stream !== 0) {
    if (tDuration.duration > 0) {
      totalDuration += `\n\nTotal length - \`${formatDuration(
        tDuration.duration,
        { leading: true }
      )}\``;
      if (tDuration.stream > 0)
        totalDuration += ` + \`${tDuration.stream}\` Streams`;
    } else {
      totalDuration += `\n\nTotal length - \`${tDuration.stream}\` Streams`;
    }
  }
  const embed = new MessageEmbed()
    .setTitle(
      'Queue' + queueLength + (player.trackRepeat ? '  -  LOOP ENABLED' : '')
    )
    .setColor(config.embed.color);
  let string = '';
  let indexes = [];
  let titles = [];
  let durations = [];
  tracks.map((track, index) => {
    indexes.push(`${++index}`);
    let string = `${escapeRegex(
      track.title.substr(0, 60).replace(/\[/giu, '\\[').replace(/\]/giu, '\\]')
    )}`;
    if (string.length > 37) {
      string = `${string.substr(0, 37)}...`;
    }
    titles.push(string);
    durations.push(
      `${
        track.isStream
          ? `LIVE STREAM`
          : formatDuration(track.duration, { leading: true })
      }`
    );
  });
  let npstring = '';
  if (player.queue.current) {
    npstring = `${escapeRegex(
      tracks.current.title
        .substr(0, 60)
        .replace(/\[/giu, '\\[')
        .replace(/\]/giu, '\\]')
    )}`;
    if (npstring.length > 37) {
      string =
        `**Now Playing - ` +
        `[${npstring.substr(0, 37)}...](${tracks.current.uri})` +
        `**\n${
          tracks.current.isStream
            ? `[:red_circle: LIVE STREAM]`
            : createProgressBar(player)
        }\n`;
    } else {
      string =
        `**Now Playing - ` +
        `[${npstring}](${tracks.current.uri})` +
        `**\n${
          tracks.current.isStream
            ? `[:red_circle: LIVE STREAM]`
            : createProgressBar(player)
        }\n`;
    }
  }
  if (indexes.length <= 15) {
    string += `\n`;
    for (let i = 0; i < tracks.length; i++) {
      let line = `**${indexes[i]})** ${titles[i]} - [${durations[i]}]`;
      string += line + '\n';
    }
    string +=
      '\n' +
      'This is the end of the queue!' +
      '\n' +
      `Use ${client.config.prefix}play to add more :^)`;
    embed
      .setDescription(string + totalDuration)
      .setFooter({ text: 'Page 1 of 1' });
    if (player.queue.current)
      embed.setThumbnail(player.queue.current.thumbnail);
  } else {
    indexes = indexes.slice(index, index + 15);
    titles = titles.slice(index, index + 15);
    durations = durations.slice(index, index + 15);
    string += `\n`;
    for (let i = 0; i < indexes.length; i++) {
      let line = `**${indexes[i]})** ${titles[i]} - [${durations[i]}]`;
      string += line + '\n';
    }
    if (Math.ceil((index + 15) / 15) == Math.ceil(tracks.length / 15))
      string +=
        '\n' +
        'This is the end of the queue!' +
        '\n' +
        '\n' +
        `Use ${client.config.prefix}play to add more :^)`;
    embed
      .setDescription(string + totalDuration)
      .setFooter({
        text:
          'Page ' +
          Math.ceil((index + 15) / 15) +
          ' of ' +
          Math.ceil(tracks.length / 15)
      })
      .setThumbnail(tracks.current.thumbnail);
  }
  return embed;
}
/**
 * Create a progress bar for the current track
 * @returns {string} progress bar
 */
export function createProgressBar(player: Player): string {
  let { size, arrow, block } = config.embed.progress_bar;
  if (!player.queue.current) return '';
  let current =
    player.queue.current.duration !== 0
      ? player.position
      : player.queue.current.duration;
  let total = player.queue.current.duration;
  const progress = Math.round((size * current) / total);
  const emptyProgress = size - progress;
  const progressString =
    block.repeat(progress) + arrow + block.repeat(emptyProgress);
  const times = `${
    new Date(player.position).toISOString().substr(11, 8) +
    ' / ' +
    (player.queue.current.duration == 0
      ? ' ◉ LIVE'
      : new Date(player.queue.current.duration).toISOString().substr(11, 8))
  }`;
  return `[${progressString}][${times}]`;
}

/**
 * Escapes regex characters in a string
 * @param  {string} string
 * @returns {string}
 */
export function escapeRegex(string: string) {
  try {
    return string.replace(/[.*+?^$`{}()|[\]\\]/g, `\\$&`);
  } catch (e) {
    Logger.error(e.stack);
  }
}

/**
 * Fetches a guild's config from mongodb
 * @returns {Promise<IGuildModel>} GuildModel
 */
export function fetchGuildConfig(guildID: string): Promise<IGuildModel | null> {
  try {
    GuildModel.findOne({ guildID: guildID }, (err, doc: IGuildModel) => {
      if (err) {
        Logger.error(err);
        return null;
      } else {
        return doc;
      }
    });
  } catch (e) {
    Logger.error(e.stack);
    return null;
  }
}
/**
 * If enabled, filters out tracks from autoplay search according to the user's config
 * @returns {Promise<SearchResult>} filtered response
 */
export async function blacklist(
  client: Client,
  player: Player,
  response: SearchResult
): Promise<SearchResult> {
  const owner: User = player.get(`autoplayOwner`);
  if (owner) {
    let userConfig = await UserModel.findOne({
      userID: owner.id
    });
    if (userConfig && userConfig.model.blacklist === true) {
      //filter tracks
      if (userConfig.model.titleBlacklist.length > 0) {
        response.tracks.forEach((track) => {
          let title = track.title.split(client.config.split);
          for (let i = 0; i < title.length; i++) {
            if (userConfig.model.titleBlacklist.includes(title[i])) {
              response.tracks.splice(response.tracks.indexOf(track), 1);
              break;
            }
          }
        });
      }
      //filter author
      if (userConfig.model.authorBlacklist.length > 0) {
        userConfig.model.authorBlacklist = userConfig.model.authorBlacklist.map(
          (x) => x.toLowerCase()
        );
        let filtered = response.tracks.filter((track) => {
          let authors = track.author.toLowerCase().split(' ');
          for (let i = 0; i < authors.length; i++) {
            if (userConfig.model.authorBlacklist.includes(authors[i])) {
              return false;
            }
          }
          return true;
        });
        response.tracks = filtered;
      }
      //filter uri
      if (userConfig.model.uriBlacklist.length > 0) {
        let filtered = response.tracks.filter((track) => {
          if (userConfig.model.uriBlacklist.includes(track.uri)) {
            return false;
          }
          return true;
        });
        response.tracks = filtered;
      }
    }
  }
  return response;
}
/**
 * If enabled, automatically adds tracks to the queue
 */

//TODO: remove
export async function autoplay(
  client: Client,
  player: Player
): Promise<void | Message<boolean>> {
  let guildModel = await GuildModel.findOne({
    guildID: player.guild
  });
  if (!guildModel || !guildModel.autoplay) return;
  if (
    (player.get(`previousTrack`) as Track).requester != client.user ||
    !player.get(`similarQueue`) ||
    (player.get(`similarQueue`) as Track[]).length === 0
  ) {
    try {
      const previoustrack: Track = player.get(`previousTrack`);
      if (!previoustrack) return;
      //update owner
      if (previoustrack.requester != client.user)
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
                .setTitle('Autoplay')
                .setDescription('No similar tracks found!')
            ]
          })
          .catch(() => {});
      }
      response.tracks = (await blacklist(client, player, response)).tracks;

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
      Logger.error(e.stack);
    }
  }
  try {
    const similarQueue: Track[] = player.get(`similarQueue`);
    //pick and remove a random track from the similar queue
    const track = similarQueue.splice(
      Math.floor(Math.random() * similarQueue.length),
      1
    )[0];
    player.set(`similarQueue`, similarQueue);
    player.queue.add(track);
    const embed = new MessageEmbed()
      .setTitle('Autoplay')
      .setDescription(`[${track.title}](${track.uri})`)
      .setColor(client.config.embed.color)
      .setThumbnail(track.thumbnail);
    (client.channels.cache.get(player.textChannel) as TextChannel)
      .send({ embeds: [embed] })
      .catch(() => {});
    return player.play();
  } catch (e) {
    Logger.error(e.stack);
  }
  return;
}
