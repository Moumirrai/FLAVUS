import { Message, MessageEmbed } from 'discord.js';
import { CommandArgs, iCommand } from 'flavus';
import { GuildModel } from '../models/guildModel';

const VolumeCommand: iCommand = {
  name: 'volume',
  aliases: ['v', 'vol'],
  voiceRequired: true,
  joinPermissionRequired: false,
  playerRequired: true,
  sameChannelRequired: true,
  visible: true,
  description: 'Sets volume or shows current volume if no argument is given',
  usage: '`<prefix>volume <number>` or `<prefix>v`',
  async execute({
    client,
    message,
    args,
    player
  }: CommandArgs): Promise<Message> {
    if (!args[0]) {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.config.embed.color)
            .setDescription(`Current volume is \`${player.volume}%\``)
        ]
      });
    } else if (isNaN(Number(args[0]))) {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.config.embed.errorcolor)
            .setTitle('Argument must be a number!')
            .setDescription(`Current volume is \`${player.volume}%\``)
        ]
      });
    } else if (
      Number(args[0]) <= 0 ||
      Number(args[0]) > client.config.maxVolume
    ) {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.config.embed.errorcolor)
            .setTitle(
              `Volume must be between 0 and ${client.config.maxVolume}!`
            )
            .setDescription(`Current volume is \`${player.volume}%\``)
        ]
      });
    }
    player.setVolume(Number(args[0]));
    message.channel.send({
      embeds: [
        new MessageEmbed()
          .setTitle('Volume set!')
          .setDescription(`Current volume is \`${player.volume}%\``)
          .setColor(client.config.embed.color)
      ]
    });
    GuildModel.findOne({ guildID: message.guild.id }, (err, settings) => {
      if (err) return client.logger.error(err);
      if (!settings) {
        settings = new GuildModel({
          guildID: message.guild.id,
          volume: Number(args[0])
        });
        settings.save().catch((err) => console.log(err));
        return message.react('👌').catch((e) => {
          client.logger.error(e);
        });
      } else {
        settings.volume = Number(args[0]);
        settings.save().catch((err) => console.log(err));
      }
    });
  }
};

export default VolumeCommand;
