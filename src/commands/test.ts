import { Message, MessageEmbed } from 'discord.js';
import { CommandArgs, iCommand } from 'flavus';
import { Track } from 'erela.js';
import { Spotify } from 'better-erela.js-spotify/dist/plugin';

interface iSpotifySearchResult {
  tracks: {
    items: object[];
  };
}


const DebugCommand: iCommand = {
  name: 'test',
  aliases: [],
  voiceRequired: false,
  joinPermissionRequired: false,
  playerRequired: true,
  sameChannelRequired: false,
  visible: false,
  description: 'debug',
  usage: '<prefix>test',
  async execute({
    client,
    message,
    args,
    player,
  }: CommandArgs): Promise<void | Message> {
    /*
    if (!args[0]) {
      return message.channel.send("You didn't provide any query!");
    }
    const query = args.join(' ');
    if (client.manager.options.plugins.length > 0) {
      let track = await (client.manager.options.plugins[0] as Spotify).resolver.makeRequest(`https://api.spotify.com/v1/search?q=${encodeURI(query)}&type=track&limit=1&offset=0`) as iSpotifySearchResult;
      console.log(track.tracks.items[0]);
    }
    //client.manager.options.plugins is an array
    //check if there is pligoin with name Spotify
    */
    console.log(player.queue[0])
  }
};

export default DebugCommand;
