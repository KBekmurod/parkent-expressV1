'use client';
import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL, TOKEN_KEY } from '../utils/constants';

export function useSocket(userId, onOrderUpdate) {
  const socketRef = useRef(null);
  const callbackRef = useRef(onOrderUpdate);

  useEffect(() => {
    callbackRef.current = onOrderUpdate;
  }, [onOrderUpdate]);

  useEffect(() => {
    if (!userId) return;

    const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;

    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      auth: token ? { token } : undefined,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      socket.emit('join', `customer:${userId}`);
    });

    socket.on('orderUpdated', (data) => {
      if (callbackRef.current) callbackRef.current(data);
    });

    socket.on('orderStatusChanged', (data) => {
      if (callbackRef.current) callbackRef.current(data);
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  return socketRef.current;
}
