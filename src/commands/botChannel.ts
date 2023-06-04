import { CommandArgs, Command } from 'flavus';

/*
 * TODO: change name, and embed
 */

const BotChannelCommand: Command = {
  name: 'statuschannel',
  aliases: ['schannel', 'setchannel'],
  description: 'Sets default text channel for bot',
  usage: '<prefix>botchannel',
  async execute({ client, message }: CommandArgs) {
    if (!message.inGuild()) {
      client.logger.error('Message is not from guild');
      return client.embeds.error(message.channel, {
        description: 'Message is not from guild'
      });
    }
    const doc = await client.functions.fetchGuildConfig(message.guild.id);
    if (!doc)
      return client.embeds.error(
        message.channel,
        'Something went wrong! - botChannelCommand - doc'
      );
    doc.statusChannel = {
      name: message.channel.name,
      id: message.channel.id
    };
    doc.save().catch((err) => client.logger.error(err));
    return client.embeds.info(message.channel, {
      description:
        'This channel will be used when the player is initialized from the web interface.',
      title: `Status channel set to \`${message.channel.name}\``,
      url: 'https://flavus.xyz/'
    });
  }
};

export default BotChannelCommand;
