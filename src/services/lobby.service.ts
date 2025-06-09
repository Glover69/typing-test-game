import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { LobbyJoinData, LobbyData, PlayerJoinedData } from '../models/data.models';

@Injectable({ providedIn: 'root' })
export class LobbyService {
  constructor(private socket: Socket) {

    this.socket = io('https://light-frank-crayfish.ngrok-free.app/typing-test', {
      path: "/socket",
      transports: ['websocket', 'polling'] // Good practice to specify transports
    });

    this.setupConnectionHandlers();
  }


  private setupConnectionHandlers(): void {
    // console.log('SocketService: Constructor called. Attempting to connect...');

    this.socket.on('connect', () => {
      // console.log('Socket.IO: Connected to /typing-test namespace with ID:', this.socket.id);
    });

    this.socket.on('disconnect', (reason) => {
      // console.log('Socket.IO: Disconnected from /typing-test namespace:', reason);
    });

    this.socket.on('connect_error', (error) => {
      // console.error('Socket.IO: Connection to /typing-test namespace error:', error);
    });

    // You can also listen to general 'error' events from the socket
    this.socket.on('error', (error) => {
      // console.error('SocketService: General socket error:', error);
    });
  }



  // --- Emitters --- //

  createLobby(data: { playerName: string, timeLimit: number, wordCount: number }): void {
    console.log('[Angular SocketService] createLobby method called. PlayerName:', data.playerName); // Log 1
    if (!this.socket) {
      console.error('[Angular SocketService] Socket object is NOT INITIALIZED!');
      return;
    }
    console.log('[Angular SocketService] Socket connected status:', this.socket.connected); // Log 2
    if (!this.socket.connected) {
      console.error('[Angular SocketService] Socket is NOT CONNECTED. Cannot emit createLobby.');
      // Potentially alert the user or attempt a reconnect.
      return;
    }
    console.log('[Angular SocketService] Socket IS connected. Emitting "createLobby" to /typing-test namespace...'); // Log 3
    this.socket.emit('createLobby', data);
  }

  // --- Listeners (returning Observables) ---
  onLobbyCreated(): Observable<LobbyData> {
    return new Observable<LobbyData>((observer) => {
      this.socket.on('lobbyCreated', (lobby: LobbyData) => {
        console.log('SocketService: Received lobbyCreated event with code:', lobby);
        observer.next(lobby);
      });
      // Cleanup when observable is unsubscribed
      return () => this.socket.off('lobbyCreated');
    });
  }

  onLobbyError(): Observable<string> {
    return new Observable<string>((observer) => {
      this.socket.on('lobbyError', (errorMessage: string) => {
        console.error('SocketService: Received lobbyError event:', errorMessage);
        observer.next(errorMessage);
      });
      // Cleanup when observable is unsubscribed
      return () => this.socket.off('lobbyError');
    });
  }

  // Add other emitters and listeners as needed (e.g., joinLobby, onPlayerJoined, etc.)

  // Ensure to disconnect socket when service is destroyed (e.g. app closes)
  // This might be better handled in AppComponent's ngOnDestroy if service is root provided
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  joinLobby(data: LobbyJoinData): void {
    if (!this.socket.connected) {
      console.error('SocketService: Socket not connected. Cannot join lobby.');
      return;
    }
    console.log('[Angular SocketService] Emitting "joinLobby" with data:', data);
    this.socket.emit('joinLobby', data);
  }

  // This event is for the player who just successfully joined
  onJoinedLobby(): Observable<LobbyData> {
    return new Observable<LobbyData>((observer) => {
      this.socket.on('joinedLobby', (data: LobbyData) => {
        console.log('[Angular SocketService] Received "joinedLobby" event with data:', data);
        observer.next(data);
      });
      // Cleanup when observable is unsubscribed
      return () => this.socket.off('joinedLobby');
    });
  }

  // This event is for the player who is readying up
  onPlayerReady(): Observable<LobbyData> {
    return new Observable<LobbyData>((observer) => {
      this.socket.on('selfReadyStatusConfirmed', (data: LobbyData) => {
        console.log('[Angular SocketService] Received "selfReadyStatusConfirmed" event with data:', data);
        observer.next(data);
      });
      // Cleanup when observable is unsubscribed
      return () => this.socket.off('selfReadyStatusConfirmed');
    });
  }

  // This event is for when thr game has been started
  onGameStarted(): Observable<LobbyData> {
    return new Observable<LobbyData>((observer) => {
      this.socket.on('gameStarted', (data: LobbyData) => {
        console.log('[Angular SocketService] Received "gameStarted" event with data:', data);
        observer.next(data);
      });
      // Cleanup when observable is unsubscribed
      return () => this.socket.off('gameStarted');
    });
  }

  // This event is for everyone in the lobby when a new player joins
  onPlayerJoined(): Observable<PlayerJoinedData> {
    return new Observable<PlayerJoinedData>((observer) => {
      this.socket.on('playerJoined', (data: PlayerJoinedData) => {
        console.log('[Angular SocketService] Received "playerJoined" event with data:', data);
        observer.next(data);
      });
      // Cleanup when observable is unsubscribed
      return () => this.socket.off('playerJoined');
    });
  }

  readyUp(data: { code: string, playerName: string, isReady: boolean }): void {
    console.log(data)
    if (!this.socket.connected) {
      console.error('SocketService: Socket not connected. Cannot start game.');
      return;
    }
    console.log(`[Angular SocketService] Emitting "readyUp" for lobby: ${data.code}`);
    this.socket.emit('readyUp', data);
  }

  startGame(data: { code: string, timeLimit: number, wordCount: number} ): void {
    if (!this.socket.connected) {
      console.error('SocketService: Socket not connected. Cannot start game.');
      return;
    }
    console.log(`[Angular SocketService] Emitting "startGame" for lobby: ${data}`);
    this.socket.emit('startGame', data);
  }

}
