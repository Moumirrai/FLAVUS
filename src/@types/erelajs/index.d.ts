import { UnresolvedTrack } from 'erela.js';

declare module 'erela.js' {
  export interface SearchResult {
    query?: string;
    url?: string;
  }
  export interface Track {
    startTime?: number;
  }

  export interface Player {
    timeout?: NodeJS.Timeout;
    hash?: string;
  }

  export interface Queue {
    history: (Track | UnresolvedTrack)[];
  }
}
