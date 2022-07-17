import { APIEndpoint } from 'flavus-api';
import { Player } from 'erela.js';
import { Connect } from '../APIFunctions';
import { User } from 'discord.js';
import { youtube } from 'scrape-youtube';

//TODO: add type to promise

const SearchEndpoint: APIEndpoint = {
  path: 'search',
  rateLimit: 0,
  async execute(client, req, res): Promise<Express.Response> {
    const query = req.body.query;
    if (!query) {
      return res.status(400).send('No query provided!');
    }
    const results = await youtube.search(query);
    if (!results.videos.length)
      return res.status(400).send('No results found!');
    const responseObject = results.videos.map((track) => {
      return {
        title: track.title,
        duration: track.duration,
        thumbnail: track.thumbnail,
        author: track.channel.name,
        uri: track.link
      };
    });
    return res.status(200).json(responseObject);
  }
};

export default SearchEndpoint;
