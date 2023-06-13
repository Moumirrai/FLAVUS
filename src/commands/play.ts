import { MessageOptions } from 'discord.js';
import { CommandArgs, Command } from 'flavus';
import { SearchResult } from 'erela.js';

const PlayCommand: Command = {
  name: 'play',
  aliases: ['p'],
  description: 'Searches for a song or playlist and plays it in your channel',
  usage: '<prefix>play <search_query>',
  requirements: {
    voiceRequired: true,
    joinPermissionRequired: true
  },

  async execute({ manager, message, args, vc, client }: CommandArgs) {
    if (!args[0]) {
      return client.embeds.error(
        message.channel,
        'No arguments were provided!'
      );
    }
    const player = await client.PlayerManager.connect(
      message,
      manager,
      vc
    );
    if (!player) {
      return client.embeds.error(message.channel, 'Player failed to connect!');
    }
    const query = args.join(' ');
    try {
      const res = (await client.PlayerManager.search(query, player, {
        author: message.author,
        handleResult: true
      })) as MessageOptions;
      if (!res) {
        throw new Error('No results were found!');
      }
      return message.channel.send(res);
    } catch (err) {
      return client.embeds.error(message.channel, {
        title: 'Error while searching',
        description: err.message
      });
    }
  }
};

export default PlayCommand;
