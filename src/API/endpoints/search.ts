import { APIEndpoint } from 'flavus-api';
import { Player } from 'erela.js';
import { Connect } from '../APIFunctions';
import { User } from 'discord.js';

//TODO: add type to promise

const SearchEndpoint: APIEndpoint = {
  path: 'search',
  rateLimit: 0,
  async execute(client, req, res): Promise<Express.Response> {
    const query = req.body.query;
    if (!query || typeof query !== 'string') return res.status(400).send('Query is required');
    const voiceCache = client.APICache.voice.get(req.session.user.id)
    if (!voiceCache) return res.status(400).send('User is not connected');
    const player: Player = client.manager.players.get(
      client.APICache.voice.get(req.session.user.id).voiceChannel.guild.id
    ) || await Connect(client, req.session);
    let search = await client.PlayerManager.search(
      query,
      player,
      client.config.anonymous? voiceCache.user : client.user
    ).catch(err => {
      console.log(err)
      return err.message
    });
    if (!search) return res.status(400).send('No results found');
    if (search.loadType === 'TRACK_LOADED' || search.loadType === 'SEARCH_RESULT') {
      res.json(search.tracks)
    }
  }
};

export default SearchEndpoint;
