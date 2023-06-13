import type { NextFunction, Request, Response } from 'express';
import Logger from '../../struct/Logger';
import { authUser } from '../authManager';
import type { Core } from '../../struct/Core';

/**
 * Middleware that checks if the request is authorized to access the protected routes.
 * @param client - The Core instance used to authenticate the user.
 * @returns An Express middleware function that checks if the request is authorized.
 */

const authMiddleware =
  (client: Core) => async (req: Request, res: Response, next: NextFunction) => {
    // Check if the request has an authorization header
    if (!req.headers.authorization) {
      Logger.log('Authentification failed! - No authorization header - Code 1');
      return res.status(401).send('Authentification failed!');
    }
    // Allow metrics endpoint to be accessed without metrics token
    if (
      req.url.startsWith('/api/metrics') &&
      req.headers.authorization === process.env.METRICS_TOKEN
    ) {
      return next();
    }
    const { session, headers } = req;
    const { code, createdAt } = session;
    const maxSessionDuration = 604800000; // 7 days in milliseconds
    // Check if the session code matches the authorization header and the session is not expired
    if (
      code === headers.authorization &&
      new Date().getTime() - createdAt < maxSessionDuration
    ) {
      return next();
    }
    // Authenticate the user
    const user = await authUser(req.headers.authorization, client);
    if (!user) {
      Logger.log('Authentication failed!  - Code 2');
      return res.status(401).send('Authentication failed!');
    }
    // Update the session with the user information
    req.session.code = req.headers.authorization;
    req.session.user = user;
    req.session.createdAt = new Date().getTime();
    return next();
  };

export default authMiddleware;
