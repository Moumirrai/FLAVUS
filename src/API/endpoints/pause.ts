import { APIEndpoint } from 'flavus-api';
import { Player } from 'erela.js';
import { Connect } from '../APIFunctions';

//TODO: add type to promise

//TODO: use socket to do this instead

const PauseEndpoint: APIEndpoint = {
  path: 'pause',
  rateLimit: 0,
  async execute(client, req, res): Promise<Express.Response> {
    const voiceCache = client.voiceCache.get(req.session.user.id)
    if (!voiceCache) return res.status(400).send('User is not connected');
    const player: Player = client.manager.players.get(
      client.voiceCache.get(req.session.user.id).voiceChannel.guild.id
    )
    if (!player || !player.current) return res.status(400).send('Nothing to pause');
    player.pause(!player.paused)
    return res.status(200).json({
      paused: player.paused
    })
  }
};

export default PauseEndpoint;
