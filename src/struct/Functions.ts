import {
  Client,
  ColorResolvable,
  Message,
  MessageEmbed,
  TextChannel
} from 'discord.js';
import { Player } from 'erela.js';
import { GuildModel } from '../models/guildModel';
import Logger from './Logger';
import { config } from '../config/config';
import formatDuration = require('format-duration');

export function formatTime(milliseconds: number, minimal = false): string {
  const times = {
    years: 0,
    months: 0,
    weeks: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  };
  while (milliseconds > 0) {
    if (milliseconds - 31557600000 >= 0) {
      milliseconds -= 31557600000;
      times.years++;
    } else if (milliseconds - 2628000000 >= 0) {
      milliseconds -= 2628000000;
      times.months++;
    } else if (milliseconds - 604800000 >= 0) {
      milliseconds -= 604800000;
      times.weeks += 7;
    } else if (milliseconds - 86400000 >= 0) {
      milliseconds -= 86400000;
      times.days++;
    } else if (milliseconds - 3600000 >= 0) {
      milliseconds -= 3600000;
      times.hours++;
    } else if (milliseconds - 60000 >= 0) {
      milliseconds -= 60000;
      times.minutes++;
    } else {
      times.seconds = Math.round(milliseconds / 1000);
      milliseconds = 0;
    }
  }
  const finalTime = [];
  let first = false;
  for (const [k, v] of Object.entries(times)) {
    if (minimal) {
      if (v === 0 && !first) {
        continue;
      }
      finalTime.push(v < 10 ? `0${v}` : `${v}`);
      first = true;
      continue;
    }
    if (v > 0) {
      finalTime.push(`${v} ${v > 1 ? k : k.slice(0, -1)}`);
    }
  }
  let time = finalTime.join(minimal ? ':' : ', ');
  if (time.includes(',')) {
    const pos = time.lastIndexOf(',');
    time = `${time.slice(0, pos)} and ${time.slice(pos + 1)}`;
  }
  return time;
}

export function random<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function createQueueEmbed(player: Player, index: number): MessageEmbed {
  const tracks = player.queue;
  let tDuration = { duration: 0, stream: 0 };
  //for each track in queue, if isStream = false, add its duration to total duration
  tracks.forEach((track) => {
    if (!track.isStream) tDuration.duration += track.duration;
    else tDuration.stream++;
  });
  //if current track is a stream, add 1 to stream, if not, add its duration to total duration
  //check if current track has property isStream, if not, add its duration to total duration

  if (player.queue.current && player.queue.current.isStream) tDuration.stream++;
  else if (player.queue.current) {
    console.log(player.queue.current);
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
    .setTitle('Queue' + queueLength)
    .setColor(config.embed.color as ColorResolvable);
  let string = '';
  var indexes = [];
  var titles = [];
  var durations = [];
  tracks.map((track, index) => {
    //load indexes
    indexes.push(`${++index}`);
    //load titles
    let string = `${escapeRegex(
      track.title.substr(0, 60).replace(/\[/giu, '\\[').replace(/\]/giu, '\\]')
    )}`;
    if (string.length > 37) {
      string = `${string.substr(0, 37)}...`;
    }
    titles.push(string);
    //load durations
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
      //check if any index in track is longer than 1 digit
      let line = `**${indexes[i]})** ${titles[i]} - [${durations[i]}]`;
      string += line + '\n';
    }
    string +=
      '\n' +
      'This is the end of the queue!' +
      '\n' +
      'Use -play to add more :^)';
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
        'Use -play to add more :^)';
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

export function createProgressBar(player: Player) {
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
  const bar = progressString;
  const times = `${
    new Date(player.position).toISOString().substr(11, 8) +
    ' / ' +
    (player.queue.current.duration == 0
      ? ' ◉ LIVE'
      : new Date(player.queue.current.duration).toISOString().substr(11, 8))
  }`;
  return `[${bar}][${times}]`;
}

export function escapeBacktick(string: string) {
  try {
    return string.replace(/`/g, '');
  } catch (e) {
    Logger.error(e.stack);
  }
}

export function escapeRegex(string: string) {
  try {
    return string.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`);
  } catch (e) {
    Logger.error(e.stack);
  }
}

export async function autoplay(client, player) {
  let guildModel = await GuildModel.findOne({
    guildID: player.guild
  });
  if (!guildModel) return;
  if (!guildModel.autoplay) return;
  if (
    player.get(`previousTrack`).requester != client.user ||
    !player.get(`similarQueue`) ||
    player.get(`similarQueue`).length === 0
  ) {
    try {
      const previoustrack = player.get(`previousTrack`);
      if (!previoustrack) return;
      const mixURL = `https://www.youtube.com/watch?v=${previoustrack.identifier}&list=RD${previoustrack.identifier}`;
      const response = await client.manager.search(mixURL, client.user);
      //if nothing is found, send error message
      if (
        !response ||
        response.loadType === 'LOAD_FAILED' ||
        response.loadType !== 'PLAYLIST_LOADED'
      ) {
        player.destroy();
        return client.channels.cache
          .get(player.textChannel)
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
      //remove every track from response.tracks that has the same identifier as the previous track
      response.tracks = response.tracks.filter(
        (track) => track.identifier !== previoustrack.identifier
      );
      //if there are no tracks left in the response, send error message
      if (!response.tracks.length) {
        player.destroy();
        return client.channels.cache
          .get(player.textChannel)
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
  }
  try {
    const similarQueue = player.get(`similarQueue`);
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
    client.channels.cache
      .get(player.textChannel)
      .send({ embeds: [embed] })
      .catch(() => {});
    return player.play();
  } catch (e) {
    client.logger.error(e.stack);
  }
  return;
}
