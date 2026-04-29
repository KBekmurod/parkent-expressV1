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
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      // Server socketAuth orqali avtomatik customer:${userId} room'iga qo'shadi
      // Qo'shimcha order:${orderId} room'lariga sahifa o'zi qo'shilishi mumkin
    });

    // Backend'da yuboriladigan to'g'ri event nomlari
    socket.on('order:update', (data) => {
      if (callbackRef.current) callbackRef.current(data);
    });

    socket.on('order:status:changed', (data) => {
      if (callbackRef.current) callbackRef.current(data);
    });

    socket.on('notification', (data) => {
      if (callbackRef.current) callbackRef.current(data);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket ulanish xatosi:', err.message);
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  return socketRef.current;
}

