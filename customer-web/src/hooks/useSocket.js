'use client';
import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../utils/constants';

export function useSocket(userId, onOrderUpdate) {
  const socketRef = useRef(null);
  const callbackRef = useRef(onOrderUpdate);

  useEffect(() => {
    callbackRef.current = onOrderUpdate;
  }, [onOrderUpdate]);

  useEffect(() => {
    if (!userId) return;

    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
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
