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
  async execute({ client, message, args }: CommandArgs): Promise<any> {
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
        return message.react('👌').catch((e) => {
          client.logger.error(e);
        });
      } else {
        if (args[0] && args[0] === 'mode') {
          if (args[1] && args[1] === 'switch') {
            settings.autoplay.mode = settings.autoplay.mode === 'yt' ? 'spotify' : 'yt';
            settings.save().catch((err) => client.logger.error(err));
            return message.channel.send('Current mode - ' + settings.autoplay.mode);
          }
          return message.channel.send('Current mode - ' + settings.autoplay.mode);
        }
        settings.autoplay.active = !settings.autoplay.active;
        settings.save().catch((err) => client.logger.error(err));
        if (settings.autoplay.active) {
          return message.react('👌').catch((e) => {
            client.logger.error(e);
          });
        } else {
          return message.react('❌').catch((e) => {
            client.logger.error(e);
          });
        }
      }
    });
  }
};

export default AutoplayCommand;
