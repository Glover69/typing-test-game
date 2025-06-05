export type CharacterStatus = {
    char: string;
    status: 'untyped' | 'correct' | 'incorrect' | 'active'; 
}

export type TypingSessionData = {
    timeSelected: number;
    allSeconds?: EachSecond[]
}

export type EachSecond = {
    second: number;
    wpm: number;
    accuracy: number;
}


// (You can place these interfaces in a separate file like `src/app/models/lobby.interfaces.ts` and import them,
// or define them within the service file if they are only used there)

export interface Player {
    id: string;
    name: string;
    progress: number;
  }
  
  export interface LobbyJoinData {
    code: string;
    playerName: string;
  }
  
  export interface LobbyData {
    code: string;
    players: Player[];
    words: string[];
    isActive: boolean;
  }
  
  export interface PlayerJoinedData {
    playerName: string;
    socketId: string;
    players: Player[]; // The updated list of all players
  }


  export type Toast = {
    header: string;
    message: string;
  }

  export interface AppTheme {
    name: string; 
    className: string; 
  }