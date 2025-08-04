import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { io, Socket } from 'socket.io-client'; // Import Socket and io from socket.io-client
const SOCKET_SERVER_URL = 'http://localhost:2005'; // Your backend WebSocket server URL
import { provideLottieOptions } from 'ngx-lottie';


import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideLottieOptions({
      player: () => import('lottie-web'),
    }),
    {
      provide: Socket,
      useFactory: () => {
        const socket = io(SOCKET_SERVER_URL, {
          path: '/socket'
        });
        
        return socket;
      },
    },
  ],
};
