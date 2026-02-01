# Backend API Documentation

Node.js/Express.js backend with MongoDB, Socket.io, and Telegram Bots.

## 🏗️ Architecture

```
backend/
├── src/
│   ├── config/          # Configuration
│   ├── controllers/     # Business logic
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── middleware/      # Middleware
│   ├── utils/           # Utilities
│   ├── socket/          # Socket.io
│   └── bots/            # Telegram bots
└── server.js            # Entry point
```

## 🚀 Getting Started

### Installation

```bash
npm install
```

### Configuration

```bash
cp .env.example .env
nano .env
```

Required environment variables:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/parkent-express
JWT_SECRET=your-secret-key
CUSTOMER_BOT_TOKEN=token
VENDOR_BOT_TOKEN=token
DRIVER_BOT_TOKEN=token
```

### Running

```bash
# Development
npm run dev

# Production
npm start

# Tests
npm test
```

## 📋 API Endpoints

See [API.md](./API.md) for complete API reference.

### Key Endpoints

**Authentication:**
- `POST /api/v1/auth/register` - Register user
- `POST /api/v1/auth/login` - Login

**Vendors:**
- `GET /api/v1/vendors` - List vendors
- `GET /api/v1/vendors/:id` - Get vendor

**Products:**
- `GET /api/v1/products` - List products
- `POST /api/v1/products` - Create product (Vendor)

**Orders:**
- `POST /api/v1/orders` - Create order (Customer)
- `GET /api/v1/orders/:id/track` - Track order

## 🔐 Authentication

All protected routes require JWT token in header:
```
Authorization: Bearer <token>
```

## 🤖 Telegram Bots

Three bots are integrated:
1. **Customer Bot** - Order food, track delivery
2. **Vendor Bot** - Manage menu, accept orders
3. **Driver Bot** - Accept deliveries, track earnings

See [TELEGRAM_BOTS.md](../docs/TELEGRAM_BOTS.md) for details.

## 🔒 Security

- Bcrypt password hashing
- JWT authentication
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation

## 📖 Additional Documentation

- [Complete API Reference](./API.md)
- [API Documentation](../docs/API_DOCUMENTATION.md)
- [Setup Guide](../docs/SETUP.md)
- [Configuration](../docs/CONFIGURATION.md)

## 📜 License

MIT License - see [LICENSE](../LICENSE)
