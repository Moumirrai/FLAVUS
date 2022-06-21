import { APIEndpoint } from 'flavus-api';
import { Player } from 'erela.js';
import { Connect } from '../APIFunctions';

//TODO: add type to promise

const SearchEndpoint: APIEndpoint = {
  path: 'search',
  rateLimit: 0,
  async execute(client, req, res): Promise<Express.Response> {
    const query = req.headers.query;
    if (!query || typeof query !== 'string') return res.status(400).send('Query is required');
    const voiceCache = client.voiceCache.get(req.session.user.id)
    if (!voiceCache) return res.status(400).send('User is not connected');
    const player: Player = client.manager.players.get(
      client.voiceCache.get(req.session.user.id).voiceChannel.guild.id
    ) || await Connect(client, req.session);
    let search = await client.PlayerManager.search(
      query,
      player,
      req.session.user
    ).catch(err => {
      console.log(err)
      return err.message
    });
    if (!search) return res.status(400).send('No results found');
    if (search.loadType === 'TRACK_LOADED' || search.loadType === 'SEARCH_RESULT') {
      if (player.state !== 'CONNECTED') {
        player.set('playerauthor', req.session.user.id);
        player.connect();
        player.queue.add(search.tracks[0]);
        player.play();
        player.pause(false);
      } else if (!player.queue || !player.queue.current) {
        player.queue.add(search.tracks[0]);
        if (!player.playing && !player.paused && !player.queue.size)
          player.play();
        player.pause(false);
      } else {
        player.queue.add(search.tracks[0]);
      }
    }
  }
};

export default SearchEndpoint;
