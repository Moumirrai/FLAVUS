import { APIEndpoint } from 'flavus-api';

//TODO: add type to promise

const AuthEndpoint: APIEndpoint = {
  path: 'auth',
  rateLimit: 0,
  async execute(client, req, res): Promise<Express.Response> {
    //log request ip address
    return res.json(req.session.user) || res.status(401).send('User not found!');
  }
};

export default AuthEndpoint;
