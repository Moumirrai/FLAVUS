import { APIEndpoint } from 'flavus-api';
import { youtube } from 'scrape-youtube';

const SearchEndpoint: APIEndpoint = {
  path: 'search',
  async execute(client, req, res) {
    const query = req.body.query;
    if (!query) {
      return res.status(400).send('No query provided!');
    }
    if (query.length > 120) {
      return res.status(400).send('Query too long!');
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
