import { MessageEmbed } from 'discord.js';
import { CommandArgs, Command } from 'flavus';

const HelpCommand: Command = {
  name: 'help',
  aliases: ['?'],
  description: 'help',
  usage: '<prfix>help [command]',
  async execute({ client, message, args }: CommandArgs) {
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
      const usage = command.usage.replace(/<prefix>/g, client.config.prefix);
      let aliases = '';
      if (command.aliases.length > 0)
        aliases = `Aliases: ${command.aliases.join(', ')}\n\n`;
      return message.channel.send({
        embeds: [
          new MessageEmbed()
          .setAuthor({ name: 'Help' })
            .setColor(client.config.embed.color)
            .setTitle(`${command.name}`)
            .setDescription(
              `${aliases}${command.description}\n\nUsage: ${usage}`
            )
        ]
      });
    }
    //send all commands names, client.commands is collection of commands that has value visible set to true
    const commands = client.commands
      .filter((c) => c.visible)
      .map((c) => `\`${c.name}\``)
      .join(', ');
    return message.channel.send({
      embeds: [
        new MessageEmbed()
          .setColor(client.config.embed.color)
          .setTitle('Help')
          .setURL('https://flavus.instatus.com/')
          .setDescription(
            '**If something is not working as it should, try looking at the status page first!\nhttps://flavus.instatus.com/ **'
          )
          .addField(
            'Commands',
            `${commands}\n\nUse \`${client.config.prefix}help <command>\` to get more info about a command`
          )
      ]
    });
  }
};

export default HelpCommand;
