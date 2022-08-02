//create messageCreate event
import { Message, MessageEmbed } from 'discord.js';
import { iEvent } from 'flavus';
import { Player } from 'erela.js';
import { Core } from '../../struct/Core';

const MessageEvent: iEvent = {
  name: 'messageCreate',
  async execute(client: Core, message: Message) {
    if (!message.content || !message.guild || message.author.bot) return;
    if (!message.content.startsWith(client.config.prefix)) return;
    const args = message.content
      .slice(client.config.prefix.length)
      .split(' ')
      .filter(Boolean);
    const commandArg = args.shift()?.toLowerCase();
    if (!commandArg) return;
    const command =
      client.commands.get(commandArg) || client.aliases.get(commandArg);
    if (!command) return;

    client.logger.log(`Command "${command.name}" executed with args: "${args.join(' ')}"`);

    const player: Player = client.manager.get(message.guild.id);
    const { channel } = message.member.voice;

    if (command.playerRequired && !player) {
      return message.channel.send(
        errorEmbed(
          'You cant use this command since nothing is playing!',
          client
        )
      );
    }
    if (command.voiceRequired && !channel) {
      return message.channel.send(
        errorEmbed(
          'You must be in a voice channel to use this command!',
          client
        )
      );
    }
    if (
      command.sameChannelRequired &&
      (!player || channel.id !== player.voiceChannel)
    ) {
      return message.channel.send(
        errorEmbed(
          'You must be in a same voice channel as me to use this command!',
          client
        )
      );
    }
    if (
      command.joinPermissionRequired &&
      !channel.permissionsFor(client.user).has('CONNECT')
    ) {
      return message.channel.send(
        errorEmbed(
          "I don't have the permissions to join your voice channel!",
          client
        )
      );
    }
    await command.execute({
      client,
      message,
      args,
      manager: client.manager,
      player,
      vc: channel
    });
  }
};

function errorEmbed(title: string, client: Core) {
  return {
    embeds: [
      new MessageEmbed()
        .setColor(client.config.embed.errorcolor)
        .setTitle(title)
    ]
  };
}

export default MessageEvent;
