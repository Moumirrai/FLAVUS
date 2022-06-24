import { APIEndpoint } from 'flavus-api';
import { Player } from 'erela.js';
import { Connect } from '../APIFunctions';

//TODO: add type to promise

const SearchEndpoint: APIEndpoint = {
  path: 'addTrack',
  rateLimit: 0,
  async execute(client, req, res): Promise<Express.Response> {
    //if user cancels, then destroy player
    let track //TODO: get track from request
    //if track is not valid return error
      if (player.state !== 'CONNECTED') {
        player.set('playerauthor', req.session.user.id);
        player.connect();
        player.queue.add(track);
        player.play();
        player.pause(false);
      } else if (!player.queue || !player.queue.current) {
        player.queue.add(track);
        if (!player.playing && !player.paused && !player.queue.size)
          player.play();
        player.pause(false);
      } else {
        player.queue.add(track);
      }
    }
};

export default SearchEndpoint;
