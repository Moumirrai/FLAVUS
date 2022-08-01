import { CommandArgs, iCommand } from 'flavus';
import { GuildModel, IGuildModel } from '../models/guildModel';
import { MessageEmbed, MessageOptions, TextChannel } from 'discord.js';

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
  async execute({ client, message }: CommandArgs): Promise<any> {
    if (!message.inGuild())
      throw client.embeds.error('Message is not from guild');

    GuildModel.findOne(
      { guildID: message.guild.id },
      (err, settings: IGuildModel) => {
        if (err) throw client.logger.error(err);
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
          throw client.logger.error(err);
        });
        return message.channel.send(
          client.embeds.message(
            new MessageEmbed()
              .setTitle(`Status channel set to \`${message.channel.name}\``)
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
