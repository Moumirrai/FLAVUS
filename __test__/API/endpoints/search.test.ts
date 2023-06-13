import SearchEndpoint from '../../../src/API/endpoints/search';
import { describe, it, expect } from 'vitest';

describe('Search Endpoint', () => {
  it('Returns 400 when no query is provided', async () => {
    const req: unknown = {
      body: {}
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
    const resp = await SearchEndpoint.execute(null, req, res);
    expect(resp).toBeDefined();
    expect(resp.status).toBe(400);
  });
  it('Returns 400 when query is over 120 characters long', async () => {
    const longQuery =
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.';
    const req: unknown = {
      body: {
        query: longQuery
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
    const resp = await SearchEndpoint.execute(null, req, res);
    expect(resp).toBeDefined();
    expect(resp.status).toBe(400);
  });
  it('Returns 200 with results when correct query is provided', async () => {
    const req: unknown = {
      body: {
        query: 'example query'
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
          },
          json: (obj: unknown) => {
            return {
              status: num,
              send: obj
            };
          }
        };
      }
    };
    const resp = await SearchEndpoint.execute(null, req, res);
    expect(resp).toBeDefined();
    expect(resp.status).toBe(200);
    expect(resp.send).toBeDefined();
    expect(resp.send.length).toBeGreaterThan(0);
    expect(resp.send[0].title).toBeDefined();
  });
});
