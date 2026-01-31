# 🍕 Parkent Express

Full-stack food delivery system with Telegram bots and admin panel.

## 🎯 Features

- 3 Telegram bots (Customer, Driver, Vendor)
- Real-time order tracking
- Admin dashboard
- Payment integration (Payme/Click)
- Location tracking

## 🏗️ Structure

```
parkent-expressV1/
├── backend/        # Express.js API
├── admin-panel/    # Next.js admin dashboard
└── README.md
```

## 🚀 Getting Started

### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Admin Panel
```bash
cd admin-panel
npm install
cp .env.local.example .env.local
npm run dev
```

## 📚 Documentation

See individual README files:
- [Backend Documentation](./backend/README.md)
- [Admin Panel Documentation](./admin-panel/README.md) (coming soon)

## 🛠️ Tech Stack

**Backend:**
- Node.js + Express.js
- MongoDB + Mongoose
- Socket.io
- Telegram Bot API

**Admin Panel:**
- Next.js 14
- TypeScript
- Tailwind CSS
- Shadcn/ui

## 👨‍💻 Author

KBekmurod

## 📄 License

MIT