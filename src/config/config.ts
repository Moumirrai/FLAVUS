import * as dotenv from 'dotenv';
dotenv.config();

export type BotConfig = {
  token: string;
  prefix: string;
  erela: {
    nodes: {
      host: string;
      port: number;
      password: string;
      retryDelay: number;
      secure: boolean;
    }[];
    shards: number | 'auto';
    clientName: string;
  };
  mongodb_uri: string;
  shard_count: number | 'auto';
  embed: {
    color: string;
    errorcolor: string;
    progress_bar: {
      size: number;
      block: string;
      empty: string;
      arrow: string;
    };
  };
  port: number;
  leaveOnEmptyChannel: number;
};

export const config: BotConfig = {
  token: process.env.TOKEN,
  prefix: process.env.PREFIX,
  erela: {
    nodes: [
      {
        host: process.env.LAVALINK_HOST,
        port: parseInt(process.env.LAVALINK_PORT),
        password: process.env.LAVALINK_PASSWORD,
        retryDelay: parseInt(process.env.LAVALINK_RETRY_DELAY),
        secure: process.env.LAVALINK_SECURE === 'true'
      }
    ],
    shards: parseInt(process.env.SHARD_COUNT),
    clientName: `${process.env.CLIENT_NAME}/${process.env.CLIENT_VERSION}`
  },
  mongodb_uri: process.env.MONGODB_SRV,
  shard_count: parseInt(process.env.SHARD_COUNT),
  embed: {
    color: '#ffcc00',
    errorcolor: '#FF0000',
    progress_bar: {
      size: 12,
      block: '▬',
      empty: '▬',
      arrow: ':blue_circle:'
    }
  },
  leaveOnEmptyChannel: parseInt(process.env.LEAVE_ON_EMPTY_CHANNEL),
  port: parseInt(process.env.PORT)
};
