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
      client,
      manager,
      vc
    );
    if (!player) {
      return client.embeds.error(message.channel, 'Player failed to connect!');
    }
    const search = args.join(' ');
    const res = await client.PlayerManager.search(
      search,
      player,
      message.author
    ).catch((err) => {
      return client.embeds.error(message.channel, {
        title: 'Error while searching',
        description: err.message.message
      });
    });
    const embed = await client.PlayerManager.handleSearchResult(
      client,
      res as SearchResult,
      player
    );
    return message.channel.send(embed as MessageOptions);
  }
};

export default PlayCommand;
