export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Parkent Express';

// Admin Telegram username - P2P to'lov uchun
export const ADMIN_TELEGRAM = process.env.NEXT_PUBLIC_ADMIN_TELEGRAM || 'parkent_express_admin';

export const ORDER_STATUSES = {
  pending: { label: 'Kutilmoqda', color: 'yellow' },
  accepted: { label: 'Qabul qilindi', color: 'blue' },
  preparing: { label: 'Tayyorlanmoqda', color: 'indigo' },
  ready: { label: 'Tayyor', color: 'purple' },
  assigned: { label: 'Haydovchi tayinlandi', color: 'pink' },
  picked_up: { label: 'Olib ketildi', color: 'orange' },
  on_the_way: { label: "Yo'lda", color: 'cyan' },
  delivered: { label: 'Yetkazildi', color: 'green' },
  cancelled: { label: 'Bekor qilindi', color: 'red' },
  rejected: { label: 'Rad etildi', color: 'red' },
};

export const PAYMENT_METHODS = [
  {
    id: 'cash',
    label: 'Naqd pul',
    icon: '💵',
    description: 'Kuryer kelganda to\'lang',
    available: true,
  },
  {
    id: 'card_to_driver',
    label: 'Karta (P2P)',
    icon: '💳',
    description: 'Telegram orqali o\'tkazing',
    available: true,
  },
  {
    id: 'payme',
    label: 'Payme',
    icon: '📱',
    description: 'Tez orada',
    available: false,
  },
  {
    id: 'click',
    label: 'Click',
    icon: '📲',
    description: 'Tez orada',
    available: false,
  },
];

export const TOKEN_KEY = 'parkent_token';
export const USER_KEY = 'parkent_user';

// Delivery fee hisoblash (so'mda)
export const DELIVERY_FEE_PER_KM = 2000; // 2000 so'm/km
export const MIN_DELIVERY_FEE = 5000;    // Minimum 5000 so'm
export const MAX_DELIVERY_FEE = 25000;   // Maximum 25000 so'm
export const FREE_DELIVERY_THRESHOLD = 0; // Hozircha bepul yo'q
