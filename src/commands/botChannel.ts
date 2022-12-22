import { CommandArgs, iCommand } from 'flavus';
import { GuildModel, IGuildModel } from '../models/guildModel';
import { Message, MessageEmbed } from 'discord.js';

/*
 * TODO: change name, and embed
 */

const BotChannelCommand: iCommand = {
  name: 'statuschannel',
  aliases: ['schannel', 'setchannel'],
  voiceRequired: false,
  joinPermissionRequired: false,
  playerRequired: false,
  sameChannelRequired: false,
  visible: true,
  description: 'Sets default text channel for bot',
  usage: '<prefix>botchannel',
  async execute({ client, message }: CommandArgs): Promise<Message> {
    if (!message.inGuild()) {
      client.logger.error('Message is not from guild');
      return message.channel.send(
        client.embeds.error('Message is not from guild')
      );
    }

    GuildModel.findOne(
      { guildID: message.guild.id },
      (err, settings: IGuildModel) => {
        if (err)
          return message.channel.send(client.embeds.error(err.toString()));
        if (!settings) {
          settings = new GuildModel({
            guildID: message.guild.id,
            statusChannel: {
              name: message.channel.name,
              id: message.channel.id
            }
          });
        } else {
          (settings.statusChannel.name = message.channel.name),
            (settings.statusChannel.id = message.channel.id);
        }
        settings.save().catch((err) => {
          return message.channel.send(client.embeds.error(err.toString()));
        });
        return message.channel.send(
          client.embeds.message(
            new MessageEmbed()
              .setTitle(`Status channel set to \`${message.channel.name}\``)
              .setURL('https://flavus.xyz/')
              .setDescription(
                'This channel will be used when the player is initialized from the web interface.'
              )
          )
        );
      }
    );
  }
};

export default BotChannelCommand;
