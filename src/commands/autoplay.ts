import { CommandArgs, iCommand } from 'flavus';
import { GuildModel } from '../models/guildModel';

const AutoplayCommand: iCommand = {
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
        settings.save().catch((err) => client.logger.error(err));
        return message.react('👌').catch((e) => {client.logger.error(e)});
      } else {
        settings.autoplay = !settings.autoplay;
        settings.save().catch((err) => client.logger.error(err));
        if (settings.autoplay) {
          return message.react('👌').catch((e) => {client.logger.error(e)});
        } else {
          return message.react('❌').catch((e) => {client.logger.error(e)});
        }
      }
    });
  }
};

export default AutoplayCommand;
