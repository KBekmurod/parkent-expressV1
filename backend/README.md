# Parkent Express - Backend

Food delivery system backend API built with Express.js and MongoDB.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- MongoDB 6+

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create .env file:
```bash
cp .env.example .env
```

3. Update .env with your configuration

4. Start development server:
```bash
npm run dev
```

Server will run on http://localhost:5000

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/       # Configuration files
│   ├── models/       # Mongoose models
│   ├── controllers/  # Route controllers
│   ├── routes/       # API routes
│   ├── middleware/   # Custom middleware
│   ├── services/     # Business logic
│   ├── bots/         # Telegram bots
│   ├── utils/        # Utility functions
│   └── socket/       # Socket.io handlers
├── uploads/          # File uploads
└── server.js         # Entry point
```

## 🔌 API Endpoints

- GET `/health` - Health check
- GET `/` - API info

(More endpoints will be added in next steps)

## 📦 Tech Stack

- Express.js - Web framework
- MongoDB - Database
- Mongoose - ODM
- JWT - Authentication
- Socket.io - Real-time
- Winston - Logging
- Telegram Bot API - Bots

## 👨‍💻 Author

KBekmurod
