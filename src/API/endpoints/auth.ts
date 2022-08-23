import { APIEndpoint } from 'flavus-api';

const AuthEndpoint: APIEndpoint = {
  path: 'auth',
  async execute(client, req, res): Promise<Express.Response> {
    return (
      res.json(req.session.user) || res.status(401).send('User not found!')
    );
  }
};

export default AuthEndpoint;
