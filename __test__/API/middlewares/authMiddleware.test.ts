import { authMiddleware } from '../../../src/API/middlewares';
import { type Core } from '../../../src/struct/Core';
import { Logger } from '../../../src/struct/Logger';
import { describe, it, expect } from 'vitest';
import { Request, Response } from 'express';

const client: unknown = {
  users: {
    fetch: (num: number) => {
      return {
        name: 'test',
        id: num
      };
    }
  },
  logger: Logger
};

const dumbNext = () => {
  return {
    status: 200
  };
};

//mock core with vitest

describe('authMiddleware', async () => {
  it('Env should be test', () => {
    expect(typeof process.env.TOKEN).toBe('string');
  });
  it('Should be a function', () => {
    expect(typeof authMiddleware).toBe('function');
  });

  it('Return 401 there is no authorization header', async () => {
    const req: unknown = {
      url: '/api/whatever',
      session: {},
      headers: {}
    };
    const res: unknown = {
      status: (num: number) => {
        return {
          send: (str: string) => {
            return {
              status: num,
              send: str
            };
          }
        };
      }
    };

    const resp = (await authMiddleware(client as Core)(
      req as Request,
      res as Response,
      dumbNext
    )) as Response;
    expect(resp).toBeDefined();
    expect(resp.status).toBe(401);
  });

  it('Return 200 if correct metrics toke in provided', async () => {
    const req: unknown = {
      url: '/api/metrics',
      session: {},
      headers: {
        authorization: process.env.METRICS_TOKEN
      }
    };
    const res: unknown = {
      status: (num: number) => {
        return {
          send: (str: string) => {
            return {
              status: num,
              send: str
            };
          }
        };
      }
    };

    const resp = (await authMiddleware(client as Core)(
      req as Request,
      res as Response,
      dumbNext
    )) as Response;

    expect(resp.status).toBe(200);
  });
});
