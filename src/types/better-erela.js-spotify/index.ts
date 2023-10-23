import { SpotifyTrack as OrigSpotify } from "better-erela.js-spotify/dist/typings";

declare module 'better-erela.js-spotify' {
  export interface SpotifyTrack extends OrigSpotify {
    id: string;
  }

}
