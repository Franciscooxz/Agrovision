import { io, Socket } from 'socket.io-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(API_URL, {
      withCredentials: true,
      autoConnect: true,
    });
  }
  return socket;
};

export const joinUserRoom = (userId: string) => {
  getSocket().emit('join', userId);
};

export default getSocket();
