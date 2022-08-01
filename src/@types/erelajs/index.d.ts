import { SearchResult } from 'erela.js';

declare module 'erela.js' {
  export interface SearchResult {
    query?: string;
  }
  export interface Track {
    startTime?: number;
  }
}
