import { APIEndpoint } from 'flavus-api';

const AuthEndpoint: APIEndpoint = {
  path: 'auth',
  rateLimit: 0,
  async execute(client, req, res): Promise<any> {
    return res.json(req.session.user);
  }
};

export default AuthEndpoint;
