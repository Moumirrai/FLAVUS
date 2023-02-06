import { CommandArgs, iCommand } from 'flavus';
import { GuildModel, IGuildModel } from '../models/guildModel';
import { Message } from 'discord.js';

/*
 * TODO: change name, and embed
 */

const BotChannelCommand: iCommand = {
  name: 'statuschannel',
  aliases: ['schannel', 'setchannel'],
  visible: true,
  description: 'Sets default text channel for bot',
  usage: '<prefix>botchannel',
  async execute({ client, message }: CommandArgs): Promise<Message> {
    if (!message.inGuild()) {
      client.logger.error('Message is not from guild');
      return client.embeds.error(message.channel, {
        description: 'Message is not from guild'
      });
    }

    GuildModel.findOne(
      { guildID: message.guild.id },
      (err, settings: IGuildModel) => {
        if (err) return client.embeds.error(message.channel, err.toString());
        if (!settings) {
          settings = new GuildModel({
            guildID: message.guild.id,
            statusChannel: {
              name: message.channel.name,
              id: message.channel.id
            }
          });
        } else {
          settings.statusChannel.name = message.channel.name;
          settings.statusChannel.id = message.channel.id;
        }
        settings.save().catch((err1) => {
          return client.embeds.error(message.channel, err1.toString());
        });
        return client.embeds.info(message.channel, {
          description:
            'This channel will be used when the player is initialized from the web interface.',
          title: `Status channel set to \`${message.channel.name}\``,
          url: 'https://flavus.xyz/'
        });
      }
    );
  }
};

export default BotChannelCommand;
