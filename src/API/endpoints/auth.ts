import { APIEndpoint } from 'flavus-api';

const AuthEndpoint: APIEndpoint = {
  path: 'auth',
  execute(client, req, res) {
    return res.json(req.session.user) || res.status(401).send('User not found!')
  }
};

export default AuthEndpoint;
