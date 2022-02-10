//create messageCreate event
import { Client, Message, MessageEmbed } from 'discord.js';
import { iEvent } from 'my-module';
import { Player } from 'erela.js';

const MessageEvent: iEvent = {
  name: 'messageCreate',
  async execute(client, message: Message) {
    if (!message.content || !message.guild || message.author.bot) return;
    if (!message.content.startsWith(client.config.prefix)) return;
    const args = message.content.slice(client.config.prefix.length).split(' ');
    const commandArg = args.shift().toLowerCase();
    const command =
      client.commands.get(commandArg) || client.aliases.get(commandArg);
    if (!command) return;

    const player: Player = client.manager.get(message.guild.id);
    const { channel } = message.member.voice;

    if (command.playerRequired && !player) {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.config.embed.errorcolor)
            .setTitle('You cant use this command since nothing is playing!')
        ]
      });
    }
    if (command.voiceRequired && !channel) {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.config.embed.errorcolor)
            .setTitle('You must be in a voice channel to use this command!')
        ]
      });
    }
    if (
      command.sameChannelRequired &&
      (!player || channel.id !== player.voiceChannel)
    ) {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.config.embed.errorcolor)
            .setTitle(
              'You must be in a same voice channel as me to use this command!'
            )
        ]
      });
    }
    if (
      command.joinPermissionRequired &&
      !channel.permissionsFor(client.user).has('CONNECT')
    ) {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.config.embed.errorcolor)
            .setTitle(
              "I don't have the permissions to join your voice channel!"
            )
        ]
      });
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

export default MessageEvent;
