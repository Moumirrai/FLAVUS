import { Message, MessageOptions } from 'discord.js';
import { CommandArgs, iCommand } from 'flavus';
import { SearchResult } from 'erela.js';

const PlayCommand: iCommand = {
  name: 'play',
  voiceRequired: true,
  aliases: ['p'],
  joinPermissionRequired: true,
  playerRequired: false,
  sameChannelRequired: false,
  description: 'Searches for a song or playlist and plays it in your channel',
  usage: '<prefix>play <search_query>',
  visible: true,
  async execute({
    manager,
    message,
    args,
    vc,
    client
  }: CommandArgs): Promise<Message> {
    if (!args[0]) {
      return message.channel.send(
        client.embeds.error('No arguments were provided!')
      );
    }
    let player = await client.PlayerManager.connect(
      message,
      client,
      manager,
      vc
    );
    if (!player) {
      return message.channel.send(
        client.embeds.error('Player failed to connect!')
      );
    }
    const search = args.join(' ') as string;
    let res = await client.PlayerManager.search(
      search,
      player,
      message.author
    ).catch((err) => {
      //TODO: test this
      return message.channel.send(
        client.embeds.error('Error while searching', err.message.message)
      );
    });
    const embed = await client.PlayerManager.handleSearchResult(
      client,
      (res as SearchResult),
      player
    );
    return message.channel.send(embed as MessageOptions);
  }
};

export default PlayCommand;
