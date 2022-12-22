import { CommandArgs, iCommand } from 'flavus';
import { GuildModel } from '../models/guildModel';
import { Message, MessageEmbed } from 'discord.js';

const AutoplayCommand: iCommand = {
  name: 'autoplay',
  aliases: [],
  voiceRequired: false,
  joinPermissionRequired: false,
  playerRequired: false,
  sameChannelRequired: false,
  visible: true,
  description: 'Toggles or changes autoplay config',
  usage: '`<prefix>autoplay` or `<prefix>autoplay switch`',
  async execute({ client, message, args }: CommandArgs): Promise<void|Message> {
    GuildModel.findOne({ guildID: message.guild.id }, (err, settings) => {
      if (err) return client.logger.error(err);
      if (!settings) {
        settings = new GuildModel({
          guildID: message.guild.id,
          autoplay: {
            active: true,
            mode: 'yt'
          }
        });
        settings.save().catch((err) => client.logger.error(err));
        return message.channel.send({
          embeds: [
            new MessageEmbed()
              .setColor(client.config.embed.color)
              .setTitle(`Autoplay is now enabled!`)
              .setDescription(
                `Current mode - **${
                  settings.autoplay.mode === 'yt' ? 'YouTube' : 'Spotify'
                }**\nTo change mode, use \`<prefix>autoplay switch\``
              )
          ]
        });
      } else {
        if (args[0] && args[0] === 'switch') {
          settings.autoplay.mode =
            settings.autoplay.mode === 'yt' ? 'spotify' : 'yt';
          settings.save().catch((err) => client.logger.error(err));
          return message.channel.send({
            embeds: [
              new MessageEmbed()
                .setColor(client.config.embed.color)
                .setTitle(`Autoplay`)
                .setDescription(
                  `Mode switched to - **${
                    settings.autoplay.mode === 'yt' ? 'YouTube' : 'Spotify'
                  }**\nTo change mode, use \`<prefix>autoplay switch\``
                )
            ]
          });
        }
        settings.autoplay.active = !settings.autoplay.active;
        settings.save().catch((err) => client.logger.error(err));
        if (settings.autoplay.active) {
          return message.channel.send({
            embeds: [
              new MessageEmbed()
                .setColor(client.config.embed.color)
                .setTitle(`Autoplay is now enabled!`)
                .setDescription(
                  `Current mode - **${
                    settings.autoplay.mode === 'yt' ? 'YouTube' : 'Spotify'
                  }**\nTo change mode, use \`<prefix>autoplay switch\``
                )
            ]
          });
        } else {
          return message.channel.send({
            embeds: [
              new MessageEmbed()
                .setColor(client.config.embed.errorcolor)
                .setTitle(`Autoplay is now disabled!`)
            ]
          });
        }
      }
    });
  }
};

export default AutoplayCommand;
