import { CommandArgs, iCommand } from 'flavus';
import { GuildModel } from '../models/guildModel';
import { MessageEmbed, MessageOptions } from 'discord.js';

/*
* PROBABLY NOT WORLING
* TODO: test and fix, use centralised database function
 */

const BotChannelCommand: iCommand = {
  name: 'botchannel',
  aliases: ['sb', 'setchannel'],
  voiceRequired: false,
  joinPermissionRequired: false,
  playerRequired: false,
  sameChannelRequired: false,
  visible: true,
  description: 'Sets default text channel for bot',
  usage: '<prefix>botchannel',
  async execute({ client, message }: CommandArgs): Promise<any> {
    GuildModel.findOne({ guildID: message.guild.id }, (err, settings) => {
      if (err) return client.logger.error(err);
      if (!settings) {
        settings = new GuildModel({
          guildID: message.guild.id,
          textChannel: {
            name: message.channel.name,
            id: message.channel.id
          }
        });
        settings.save().catch((err) => client.logger.error(err));
        //return message.react('👌').catch((e) => {});
        return message.channel.send(client.embeds.message(new MessageEmbed().setTitle(`Status channel set to \`${message.channel.name}\``)))
      } else {
        settings.textChannel.name = message.channel.name;
        settings.textChannel.id = message.channel.id;
        settings.save().catch((err) => client.logger.error(err));
        return message.channel.send(client.embeds.message(new MessageEmbed().setTitle(`Status channel set to \`${message.channel.name}\``)))
      }
    });
  }
};

export default BotChannelCommand;
