import { Message, MessageEmbed } from 'discord.js';
import { CommandArgs, iCommand } from 'flavus';

const HelpCommand: iCommand = {
  name: 'help',
  aliases: ['?'],
  voiceRequired: false,
  joinPermissionRequired: false,
  playerRequired: false,
  sameChannelRequired: false,
  visible: true,
  description: 'help',
  usage: 'help',
  async execute({ client, message, args }: CommandArgs): Promise<Message> {
    if (args[0]) {
      const command =
        client.commands.get(args[0]) || client.aliases.get(args[0]);
      if (!command)
        return message.channel.send({
          embeds: [
            new MessageEmbed()
              .setColor(client.config.embed.errorcolor)
              .setTitle(`Command ${args[0]} doesn't exist!`)
          ]
        });
      //in command.description replace every <prefix> with client.config.prefix
      let usage = command.usage.replace(/<prefix>/g, client.config.prefix);
      let aliases = '';
      if (command.aliases.length > 0)
        aliases = `Aliases: ${command.aliases.join(', ')}\n\n`;
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.config.embed.color)
            .setTitle(`${command.name}`)
            .setDescription(
              `${aliases}${command.description}\n\nUsage: \`${usage}\``
            )
        ]
      });
    }
    //send all commands names, client.commands is collection of commands that has value visible set to true
    let commands = client.commands
      .filter((c) => c.visible)
      .map((c) => c.name)
      .join('\n');
    return message.channel.send({
      embeds: [
        new MessageEmbed()
          .setColor(client.config.embed.color)
          .setTitle('Commands')
          .setDescription(
            `${commands}\n\nUse \`${client.config.prefix}help <command>\` to get more info about a command`
          )
      ]
    });
  }
};

export default HelpCommand;
