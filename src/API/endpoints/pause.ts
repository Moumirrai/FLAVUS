import { APIEndpoint } from 'flavus-api';
import { Player } from 'erela.js';
import { Connect } from '../APIFunctions';

//TODO: add type to promise

const SearchEndpoint: APIEndpoint = {
  path: 'pause',
  rateLimit: 0,
  async execute(client, req, res): Promise<Express.Response> {
    return null
    //TODO: implement
  }
};

export default SearchEndpoint;
