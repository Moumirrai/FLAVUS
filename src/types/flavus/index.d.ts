declare module 'flavus' {

  //conditions for a command to be executed
  export interface CommandRequirements {
    voiceRequired?: boolean;
    playerRequired?: boolean;
    currentTrackRequired?: boolean;
    sameChannelRequired?: boolean;
    joinPermissionRequired?: boolean;
    devOnly?: boolean;
  }
  //client events
  export interface iEvent {
    name: string;
    execute: (client: import('../../struct/Core').Core, ...args: any[]) => void;
  }
  //manager events
  export interface iManagerEvent {
    name: string;
    execute: (
      client: import('../../struct/Core').Core,
      manager: import('erela.js').Manager,
      ...args: any[]
    ) => void;
  }

  export interface iSpotifySearchResult {
    tracks: {
      items: import('better-erela.js-spotify').SpotifyTrack[];
    };
  }

  export interface iSpotifyRecommResult {
    tracks: import('better-erela.js-spotify').SpotifyTrack[];
  }
}
