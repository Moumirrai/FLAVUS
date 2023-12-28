import { UnresolvedTrack } from 'magmastream';

declare module 'magmastream' {
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
