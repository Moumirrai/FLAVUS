import { config as dotenvConfig } from 'dotenv';
import { ColorResolvable } from 'discord.js';
import { NodeOptions } from 'magmastream';
dotenvConfig();

export type BotConfig = {
  token: string;
  clientId: string;
  prefix: string;
  owner: string;
  erela: {
    nodes: NodeOptions[];
    shards: number;
    clientName: string;
  };
  mongodb_uri: string;
  shard_count: number | 'auto';
  embed: {
    color: number;
    errorcolor: ColorResolvable;
    progress_bar: {
      size: number;
      block: string;
      empty: string;
      arrow: string;
    };
  };
  maxVolume: number;
  leaveOnEmptyChannel: number;
  split: RegExp;
  anonymous: boolean;
  debugMode: boolean;
  api: boolean;
  ratelimit: {
    socket: {
      //TODO: Use this
      hp: {
        points: number;
        duration: number;
      };
      lp: {
        points: number;
        duration: number;
      };
    };
    api: {
      //TODO: Use this
      hp: {
        points: number;
        duration: number;
      };
      lp: {
        points: number;
        duration: number;
      };
    };
  };
  loginExpire: string;
};

export const config: BotConfig = {
  token: process.env.TOKEN,
  clientId: process.env.CLIENT_ID,
  prefix: process.env.PREFIX,
  owner: process.env.OWNER,
  erela: {
    nodes: [
      {
        host: process.env.LAVALINK_HOST,
        port: parseInt(process.env.LAVALINK_PORT),
        password: process.env.LAVALINK_PASSWORD,
        retryDelay: parseInt(process.env.LAVALINK_RETRY_DELAY),
        secure: process.env.LAVALINK_SECURE === 'true',
        identifier: process.env.REDIRECTURI, //why not
        resumeStatus: true,
        resumeTimeout: 1000,
        requestTimeout: 1000,
        retryAmount: 1000,
        //rest: process.env.LAVALINK_REST === 'true'
      }
    ],
    shards: parseInt(process.env.SHARD_COUNT),
    clientName: `${process.env.CLIENT_NAME}/${process.env.CLIENT_VERSION}`
  },
  mongodb_uri: process.env.MONGODB_SRV,
  shard_count: parseInt(process.env.SHARD_COUNT),
  embed: {
    color: 0xffcc00,
    errorcolor: '#FF0000',
    progress_bar: {
      size: 12,
      block: '▬',
      empty: '▬',
      arrow: ':blue_circle:'
    }
  },
  maxVolume: 100,
  leaveOnEmptyChannel: parseInt(process.env.LEAVE_ON_EMPTY_CHANNEL),
  split: new RegExp(/[ -/<>(){}\[\].,\\*-+=%'´§_:?!°"#&@|˛`˙˝¨¸~•]+/u),
  anonymous: process.env.ANONYMOUS === 'true',
  debugMode: process.env.DEBUGMODE === 'true',
  api: process.env.API === 'true',
  ratelimit: {
    socket: {
      hp: {
        points: 1,
        duration: 1
      },
      lp: {
        points: 5,
        duration: 1
      }
    },
    api: {
      hp: {
        points: 1,
        duration: 1
      },
      lp: {
        points: 5,
        duration: 1
      }
    }
  },
  loginExpire: "7d"
};
