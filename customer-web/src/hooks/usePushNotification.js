'use client';
import { useState, useEffect } from 'react';

/**
 * Web Push Notification hook
 * Foydalanuvchi ruxsat bersa, buyurtma holati o'zgarganda
 * telefon ekranida bildirishnoma chiqadi
 */
export function usePushNotification() {
  const [permission, setPermission] = useState('default');
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isSupported = 'Notification' in window && 'serviceWorker' in navigator;
    setSupported(isSupported);
    if (isSupported) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!supported) return 'unsupported';
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch {
      return 'denied';
    }
  };

  const sendLocalNotification = (title, body, options = {}) => {
    if (permission !== 'granted') return;
    try {
      new Notification(title, {
        body,
        icon: '/web/icons/icon-192.png',
        badge: '/web/icons/icon-192.png',
        ...options,
      });
    } catch (err) {
      console.warn('Notification error:', err);
    }
  };

  return { permission, supported, requestPermission, sendLocalNotification };
}
