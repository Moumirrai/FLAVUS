//create messageCreate event
import { Message } from 'discord.js';
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

    client.logger.log(
      `Command "${command.name}" executed with args: "${args.join(' ')}"`
    );

    if (!command.requirements) {
      return command.execute({
        client,
        message,
        args,
        manager: client.manager
      });
    }

    const player: Player = client.manager.get(message.guild.id);
    const { channel } = message.member.voice;

    if (command.requirements.playerRequired && !player) {
      return client.embeds.error(
        message.channel,
        'You cant use this command since nothing is playing!'
      );
    }
    if (command.requirements.voiceRequired && !channel) {
      return client.embeds.error(
        message.channel,
        'You must be in a voice channel to use this command!'
      );
    }
    if (
      command.requirements.sameChannelRequired &&
      (channel.id !== player?.voiceChannel)
    ) {
      return client.embeds.error(
        message.channel,
        'You must be in a same voice channel as me to use this command!'
      );
    }
    if (
      command.requirements.joinPermissionRequired &&
      !channel.permissionsFor(client.user).has('CONNECT')
    ) {
      return client.embeds.error(
        message.channel,
        "I don't have the permissions to join your voice channel!"
      );
    }
    command.execute({
      client,
      message,
      args,
      manager: client.manager,
      player,
      vc: channel
    });
  }
};

export default MessageEvent;
