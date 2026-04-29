# 🍕 Parkent Express — Food Delivery System

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green.svg)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
[![CI](https://img.shields.io/badge/CI-GitHub_Actions-orange.svg)](https://github.com/features/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

O'zbekiston bozori uchun to'liq tayyor food delivery platforma.

## ✨ Asosiy xususiyatlar

### 🔧 Backend API
- **JWT autentifikatsiya** — admin, web foydalanuvchi, telegram bot uchun
- **60+ REST endpoint** — barcha biznes logika
- **Socket.io** — real-vaqt kuzatuv va bildirishnomalar
- **Auto-assign** — buyurtma tayyor bo'lganda eng yaqin haydovchi avtomatik biriktiriladi
- **Dinamik yetkazish narxi** — masofaga qarab hisoblanadi (haversine formula)
- **Redis state** — bot holatlari server qayta ishlaganda saqlanib qoladi
- **Xavfsizlik** — rate limiting, CORS, helmet, xss-clean, mongo-sanitize

### 🤖 Telegram Botlar (3 ta)
- **Customer Bot** — restoran ko'rish, buyurtma berish, kuzatish
- **Vendor Bot** — menyu, buyurtmalarni qabul/rad, statistika
- **Driver Bot** — ro'yxatdan o'tish, buyurtma qabul, GPS, daromad

### 🖥️ Admin Panel (React + Vite)
- Dashboard, foydalanuvchilar, sotuvchilar, haydovchilar, buyurtmalar
- Karta to'lovlari, hisob-kitoblar, analytics, hisobotlar

### 🌐 Customer Web (Next.js)
- PIN orqali autentifikatsiya (alohida `webPhone` maydoni)
- Savat, checkout, buyurtma kuzatish

## 🏗️ Texnologiyalar

| Qatlam | Texnologiya |
|--------|-------------|
| Backend | Node.js 18+, Express.js, MongoDB 7, Mongoose |
| Real-vaqt | Socket.io |
| Cache/State | Redis (ioredis), in-memory fallback |
| Frontend | React 18, Vite 5, TailwindCSS, Recharts |
| Web mijoz | Next.js 14, TailwindCSS |
| DevOps | Docker Compose, Nginx, PM2 |
| CI/CD | GitHub Actions |
| Test | Jest, Supertest, mongodb-memory-server |

## 🚀 Tez boshlash

### Talab qilinadigan dasturlar
- Node.js 18+
- MongoDB 7.0+
- Docker & Docker Compose (tavsiya)
- Telegram Bot tokenlar (@BotFather dan)

### Docker (tavsiya)

```bash
git clone https://github.com/KBekmurod/parkent-expressV1.git
cd parkent-expressV1

# Muhit o'zgaruvchilarini sozlang
cp backend/.env.example backend/.env
# .env faylini tahrirlang

# Ishga tushirish
docker-compose up -d

# API: http://localhost:5000
# Admin: http://localhost:3000
# Web: http://localhost:3001
```

### Qo'lda o'rnatish

**Backend:**
```bash
cd backend
npm install
cp .env.example .env
# .env faylini to'ldiring
npm run dev
```

**Admin panel:**
```bash
cd admin-panel
npm install
npm run dev
```

**Customer web:**
```bash
cd customer-web
npm install
npm run dev
```

## 🧪 Testlar

```bash
cd backend
npm install
npm test              # barcha testlar
npm test -- --testPathPattern="unit"        # faqat unit testlar
npm test -- --testPathPattern="integration" # faqat integration testlar
npm run test:coverage # qoplama hisoboti
```

### Test qoplamasiga kiradi:
- Order number generator logikasi
- Dinamik yetkazish narxi hisoblash
- Order status o'tish qoidalari
- BotStateStore (Redis/memory fallback)
- Validators (admin, order, driver)
- Auth API (register, login, token tekshiruvi)
- Orders & Drivers API integration

## ⚙️ Asosiy konfiguratsiya

```env
# backend/.env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/parkent-express
JWT_SECRET=kamida-32-belgili-kalit
CUSTOMER_BOT_TOKEN=telegram-token
VENDOR_BOT_TOKEN=telegram-token
DRIVER_BOT_TOKEN=telegram-token

# Redis (ixtiyoriy — bo'lmasa xotirada ishlaydi)
# REDIS_URL=redis://localhost:6379

API_URL=http://localhost:5000/api/v1
```

## 📁 Loyiha tuzilmasi

```
parkent-expressV1/
├── .github/workflows/ci.yml    # CI/CD (GitHub Actions)
├── backend/
│   ├── src/
│   │   ├── bots/               # Customer, Vendor, Driver botlar
│   │   ├── controllers/        # Biznes logika (11 ta)
│   │   ├── models/             # MongoDB modellari (11 ta)
│   │   ├── routes/             # API marshrутлari (12 ta, admin ham)
│   │   ├── services/           # autoAssign.service.js va boshqalar
│   │   └── utils/              # redis.js, botStateStore.js va boshqalar
│   └── tests/
│       ├── unit/               # Unit testlar
│       └── integration/        # Integration testlar
├── admin-panel/                # React admin panel
├── customer-web/               # Next.js web ilova
├── nginx/                      # Nginx konfiguratsiyasi
├── scripts/                    # backup.sh, restore.sh, deploy.sh
└── docker-compose.yml
```

## 🔑 Asosiy API endpointlar

```
POST  /api/v1/auth/login          # Admin kirish
POST  /api/v1/auth/web/register   # Web mijoz ro'yxatdan o'tish
POST  /api/v1/auth/web/login      # Web mijoz kirish
GET   /api/v1/vendors             # Restoranlar ro'yxati
POST  /api/v1/orders              # Buyurtma yaratish (auto-assign ishga tushadi)
GET   /api/v1/orders/:id          # Buyurtma holati
PUT   /api/v1/orders/:id/status   # Holat yangilash
GET   /api/v1/admin/dashboard     # Dashboard statistika
PUT   /api/v1/admin/drivers/:id/approve  # Haydovchi tasdiqlash
```

## 🤖 Telegram Botlar sozlash

1. @BotFather da 3 ta bot yarating
2. Tokenlarni `.env` ga kiriting
3. `npm run dev` yoki `docker-compose up`

## 🏭 Production deploy

```bash
# Muhit o'zgaruvchilarini sozlang
cp backend/.env.example backend/.env.production
# .env.production faylini tahrirlang

# Production ishga tushirish
docker-compose -f docker-compose.prod.yml up -d

# Loglar
docker-compose logs -f backend

# Zaxira nusxa
./scripts/backup.sh
```

## 🗺️ Rejalashtirilgan

- [ ] Click/Payme/Uzum to'lov shlyuzi
- [ ] React Native mobil ilova
- [ ] Push notification (FCM)
- [ ] Promo kodlar tizimi
- [ ] Mijozlar uchun sodiqlik dasturi

---

**KBekmurod tomonidan ❤️ bilan yaratildi**
