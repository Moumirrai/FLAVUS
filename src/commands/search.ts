import {
  Message,
  MessageActionRow,
  MessageEmbed,
  MessageSelectMenu
} from 'discord.js';
import { Player } from 'erela.js';
import { CommandArgs, iCommand } from 'my-module';
import formatDuration = require('format-duration');
import { format } from 'winston';

const SearchCommand: iCommand = {
  name: 'search',
  voiceRequired: true,
  aliases: ['sr'],
  joinPermissionRequired: true,
  playerRequired: false,
  sameChannelRequired: false,
  description: 'search_description',
  usage: '<prefix>sr <search_query>',
  visible: true,
  async execute({
    manager,
    message,
    args,
    vc,
    client
  }: CommandArgs): Promise<Message> {
    if (!args) {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.config.embed.errorcolor)
            .setTitle('No arguments were provided!')
        ]
      });
    }
    const search = args.join(' ') as string;
    try {
      var res;
      var player: Player = client.manager.players.get(message.guild.id);
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
        player.connect();
        player.stop();
      }
      try {
        // Search for tracks using a query or url, using a query searches youtube automatically and the track requester object
        res = await client.manager.search(
          {
            query: search,
            source: 'youtube'
          },
          message.author
        );
        // Check the load type as this command is not that advanced for basics
        if (res.loadType === 'LOAD_FAILED') throw res.exception;
        else if (res.loadType === 'PLAYLIST_LOADED')
          throw {
            message: 'Playlists are not supported with this command'
          };
      } catch (e) {
        client.logger.error(e.stack);
        return message.channel.send({
          embeds: [
            new MessageEmbed()
              .setColor(client.config.embed.errorcolor)
              .setTitle('Error while searching: `' + search + '`**')
              .setDescription(e.stack)
          ]
        });
      }

      if (!res.tracks[0]) {
        return message.channel.send({
          embeds: [
            new MessageEmbed()
              .setColor(client.config.embed.errorcolor)
              .setTitle(
                String('Nothing found for: **`' + search).substr(0, 256 - 3) +
                  '`**'
              )
          ]
        });
      }

      var max = 10;
      var collected;
      var cmduser = message.author;
      if (res.tracks.length < max) max = res.tracks.length;
      var track = res.tracks[0];
      var theresults = res.tracks.slice(0, max);
      var results = theresults
        .map(
          (track, index) =>
            `**${++index})** [\`${String(
              client.functions.escapeBacktick(track.title)
            )
              .substr(0, 60)
              .split('[')
              .join('{')
              .split(']')
              .join('}')}\`](${track.uri}) - \`${formatDuration(
              track.duration,
              { leading: true }
            )}\``
        )
        .join('\n');

      const emojiarray = [
        '1️⃣',
        '2️⃣',
        '3️⃣',
        '4️⃣',
        '5️⃣',
        '6️⃣',
        '7️⃣',
        '8️⃣',
        '9️⃣',
        '🔟'
      ];
      first_layer();
      async function first_layer() {
        //define the selection
        var songoptions = [
          ...emojiarray.slice(0, max).map((emoji, index) => {
            return {
              value: `Add ${index + 1}. Track`.substr(0, 25),
              label: `Add ${index + 1}. Track`.substr(0, 25),
              description: `Add: ${res.tracks[index].title}`.substr(0, 50),
              emoji: `${emoji}`
            };
          }),
          {
            value: `Cancel`,
            label: `Cancel`,
            description: `Cancel the Searching Process`,
            emoji: '❌'
          }
        ];
        let Selection = new MessageSelectMenu()
          .setCustomId('MenuSelection')
          .setMaxValues(emojiarray.slice(0, max).length)
          .setPlaceholder('Select all Songs you want to add')
          .addOptions(songoptions);
        //send the menu msg
        let menumsg;
        menumsg = await message.channel
          .send({
            embeds: [
              new MessageEmbed()
                .setTitle(
                  `Results for: **\`${search}`.substr(0, 256 - 3) + '`**'
                )
                .setColor(client.config.embed.color)
                .setDescription(results)
            ],
            components: [new MessageActionRow().addComponents(Selection)]
          })
          .catch(() => {});
        //Create the collector
        const collector = menumsg.createMessageComponentCollector({
          filter: (i) =>
            i.isSelectMenu() && i.message.author.id == client.user.id && i.user,
          time: 90000
        });
        //Menu Collections
        collector.on('collect', async (menu) => {
          if (menu.user.id === cmduser.id) {
            collector.stop();
            menu.deferUpdate();
            //chek if any of menu.vaues is equal to cancel
            if (menu.values.includes('Cancel')) {
              await menumsg.delete().catch(() => {});
              return message.react('❌').catch((e) => {});
            }
            var picked_songs = [];
            let toAddTracks = [];
            for (const value of menu.values) {
              let songIndex = songoptions.findIndex((d) => d.value == value);
              var track = res.tracks[songIndex];
              toAddTracks.push(track);
              picked_songs.push(
                `**${songIndex + 1})** [\`${String(
                  client.functions.escapeBacktick(track.title)
                )
                  .substr(0, 60)
                  .split('[')
                  .join('\\[')
                  .split(']')
                  .join('\\]')}\`](${track.uri}) - \`${formatDuration(
                  track.duration,
                  { leading: true }
                )}\``
              );
            }
            menumsg.edit({
              embeds: [
                menumsg.embeds[0]
                  .setTitle(`Picked Songs:`)
                  .setDescription(picked_songs.join('\n\n'))
              ],
              components: []
            });
            if (player.state !== 'CONNECTED') {
              //set the variables
              player.set('message', message);
              player.set('playerauthor', message.author.id);
              player.connect();
              //add track
              player.queue.add(toAddTracks);
              //set the variables
              //play track
              player.play();
              player.pause(false);
            } else if (!player.queue || !player.queue.current) {
              //add track
              player.queue.add(toAddTracks);
              //play track
              player.play();
              player.pause(false);
            } else {
              player.queue.add(toAddTracks);
              var track = toAddTracks[0];
              var embed3 = new MessageEmbed()
                .setTitle(
                  `Added ${
                    toAddTracks.length > 1
                      ? `${toAddTracks.length} Tracks, with the first one beeing: `
                      : ``
                  }${track.title}`
                )
                .setDescription(`**Queued [${track.title}](${track.uri})**`)
                .setColor(client.config.embed.color)
                .addField(
                  'Duration: ',
                  `\`${
                    track.isStream ? 'LIVE STREAM' : format(track.duration)
                  }\``,
                  true
                )
                .addField('Song By: ', `\`${track.author}\``, true);

              await message.channel
                .send({
                  embeds: [embed3]
                })
                .catch(() => {});
            }
          } else
            menu.reply({
              content: `You are not allowed to do that! Only: <@${cmduser.id}>`,
              ephemeral: true
            });
        });
        //Once the Collections ended edit the menu message
        collector.on('end', (collected) => {});
      }
    } catch (e) {
      client.logger.error(e.stack);
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.config.embed.errorcolor)
            .setTitle(
              String('Nothing found for: **`' + search).substr(0, 256 - 3) +
                '`**'
            )
        ]
      });
    }
  }
};

export default SearchCommand;
