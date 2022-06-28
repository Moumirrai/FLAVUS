import { Message, MessageEmbed } from 'discord.js';
import { Player } from 'erela.js';
import { CommandArgs, iCommand } from 'flavus';
import { IGuildModel } from '../models/guildModel';
import formatDuration = require('format-duration');
var validUrl = require('valid-url');

//TODO: rework using playemanager search

const PlayCommand: iCommand = {
  name: 'play',
  voiceRequired: true,
  aliases: ['p'],
  joinPermissionRequired: true,
  playerRequired: false,
  sameChannelRequired: false,
  description: 'Searches for a song or playlist and plays it in your channel',
  usage: '<prefix>play <search_query>',
  visible: true,
  async execute({
    manager,
    message,
    args,
    vc,
    client
  }: CommandArgs): Promise<Message> {
    if (!args[0]) {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.config.embed.errorcolor)
            .setTitle('No arguments were provided!')
        ]
      });
    }
    const search = args.join(' ') as string;
    let res;
    let player = await client.PlayerManager.connect(
      message,
      client,
      manager,
      vc
    )
    if (!player) {
      console.log('error100')
      //TODO: create universal error embed
    }
    let result = await client.PlayerManager.search(
      search,
      player,
      message.author
    )
    if (result.loadType === 'PLAYLIST_LOADED')
    /*
    try {
      //check if search is a url
      if (search.includes('open.spotify.com/') || validUrl.isUri(search)) {
        res = await player.search(search, message.author);
      } else {
        res = await player.search(
          {
            query: search,
            source: 'youtube'
          },
          message.author
        );
      }
      if (res.loadType === 'LOAD_FAILED') {
        if (!player.queue.current) player.destroy();
        throw res.exception;
      }
    } catch (err) {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.config.embed.errorcolor)
            .setTitle('Search error!')
            .setDescription(`\`\`\`${err.message}\`\`\``)
        ]
      });
    }

     */

    switch (res.loadType) {
      case 'NO_MATCHES':
        if (!player.queue.current) player.destroy();
        return message.channel.send({
          embeds: [
            new MessageEmbed()
              .setColor(client.config.embed.errorcolor)
              .setTitle(
                String('Found nothing for: **`' + search).substring(0, 253) + '`**'
              )
          ]
        });
      case 'TRACK_LOADED':
      case 'SEARCH_RESULT':
        if (player.state !== 'CONNECTED') {
          player.set('playerauthor', message.author.id);
          player.connect();
          player.queue.add(res.tracks[0]);
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

      case 'PLAYLIST_LOADED':
        if (player.state !== 'CONNECTED') {
          player.set('playerauthor', message.author.id);
          player.connect();
          player.queue.add(res.tracks);
          player.play();
        } else if (!player.queue || !player.queue.current) {
          player.queue.add(res.tracks);
          player.play();
          player.pause(false);
        } else {
          player.queue.add(res.tracks);
        }
        return message.channel.send({
          embeds: [
            new MessageEmbed()
              .setColor(client.config.embed.color)
              .setURL(res.playlist.uri)
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
          ]
        });
    }
  }
};

export default PlayCommand;
