import { Client, Message, User, VoiceBasedChannel } from 'discord.js';
import { Manager, Player, SearchResult } from 'erela.js';
import { UserInterface } from 'flavus-api';
var validUrl = require('valid-url');

export async function connect(
  message: Message,
  client: Client,
  manager: Manager,
  vc: VoiceBasedChannel
): Promise<Player> {
  var player: Player = client.manager.players.get(message.guild.id);
  if (player && player.node && !player.node.connected)
    await player.node.connect();
  if (!player) {
    player = await manager.create({
      guild: message.guild.id,
      voiceChannel: vc.id,
      textChannel: message.channel.id,
      selfDeafen: true
    });
    if (player && player.node && !player.node.connected)
      await player.node.connect();
  }
  //TODO: try to remove this, no need to connect if user is just searching and then cnacels 
  if (player.state !== 'CONNECTED') {
    player.set('playerauthor', message.author.id);
    player.connect();
    player.stop();
  }
  return player;
}

export async function search(
  query: string,
  player: Player,
  author: UserInterface
): Promise<SearchResult> {
  let res: SearchResult;
  try {
    if (query.includes('open.spotify.com/') || validUrl.isUri(query)) {
      res = await player.search(query, author);
    } else {
      res = await player.search(
        {
          query: query,
          source: 'youtube'
        },
        author
      );
    }
    if (res.loadType === 'LOAD_FAILED') {
      throw res.exception;
    }
  } catch (err) {
    console.log(err);
    throw err.message;
  }

  switch (res.loadType) {
    case 'NO_MATCHES':
      throw 'No matches found!';
    case 'TRACK_LOADED':
    case 'SEARCH_RESULT':
    case 'PLAYLIST_LOADED':
      return res;
    default:
      throw 'Unknown load type!';
  }
}
