export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Parkent Express';

export const ORDER_STATUSES = {
  pending: { label: 'Kutilmoqda', color: 'yellow' },
  accepted: { label: 'Qabul qilindi', color: 'blue' },
  preparing: { label: 'Tayyorlanmoqda', color: 'indigo' },
  ready: { label: 'Tayyor', color: 'purple' },
  assigned: { label: 'Haydovchi tayinlandi', color: 'pink' },
  picked_up: { label: 'Olib ketildi', color: 'orange' },
  on_the_way: { label: 'Yo\'lda', color: 'cyan' },
  delivered: { label: 'Yetkazildi', color: 'green' },
  cancelled: { label: 'Bekor qilindi', color: 'red' },
  rejected: { label: 'Rad etildi', color: 'red' },
};

export const PAYMENT_METHODS = [
  { id: 'cash', label: 'Naqd pul' },
  { id: 'card', label: 'Karta' },
  { id: 'payme', label: 'Payme' },
  { id: 'click', label: 'Click' },
];

export const TOKEN_KEY = 'parkent_token';
export const USER_KEY = 'parkent_user';
