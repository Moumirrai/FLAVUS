import { Message, MessageEmbed } from 'discord.js';
import { CommandArgs, iCommand } from 'flavus';

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
  }: CommandArgs) {
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
    const doc = await client.functions.fetchGuildConfig(message.guild.id);
    if (!doc) {
      client.logger.error('Something went wrong! - Doc not found - volume.ts');
      return client.embeds.error(message.channel, 'Something went wrong! - volume.ts');
    }
    doc.volume = Number(args[0]);
    doc.save().catch((err) => client.logger.error(err));
    return;
  }
};

export default VolumeCommand;
