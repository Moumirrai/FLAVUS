import { Message, MessageEmbed } from 'discord.js';
import { CommandArgs, iCommand } from 'my-module';
import { GuildModel } from '../models/guildModel';

const PingCommand: iCommand = {
  name: 'autoplay',
  aliases: [],
  voiceRequired: false,
  joinPermissionRequired: false,
  playerRequired: false,
  sameChannelRequired: false,
  visible: true,
  description: 'Toggles autoplay',
  usage: '<prefix>autoplay',
  async execute({ client, message }: CommandArgs): Promise<any> {
    GuildModel.findOne({ guildID: message.guild.id }, (err, settings) => {
      if (err) return client.logger.error(err);
      if (!settings) {
        settings = new GuildModel({
          guildID: message.guild.id,
          autoplay: true
        });
        settings.save().catch((err) => console.log(err));
        return message.react('👌').catch((e) => {});
      } else {
        settings.autoplay = !settings.autoplay;
        settings.save().catch((err) => console.log(err));
        if (settings.autoplay) {
          return message.react('👌').catch((e) => {});
        } else {
          return message.react('❌').catch((e) => {});
        }
      }
    });
  }
};

export default PingCommand;
