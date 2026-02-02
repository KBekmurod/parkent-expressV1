# 🍕 Parkent Express - Food Delivery System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green.svg)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)

Complete food delivery platform with Backend API, Telegram Bots, and Admin Panel.

## ✨ Features

### 🔧 Backend API
- **Authentication & Authorization** - JWT-based with role management
- **RESTful API** - 60+ endpoints
- **Real-time Communication** - Socket.io for live tracking
- **File Upload** - Image upload for products/documents
- **Security** - Rate limiting, CORS, helmet
- **Database** - MongoDB with Mongoose ODM

### 🤖 Telegram Bots (3 Bots)
- **Customer Bot** - Browse vendors, order food, track delivery
- **Vendor Bot** - Manage menu, accept orders, track performance
- **Driver Bot** - Accept deliveries, GPS tracking, earnings

### 🖥️ Admin Panel
- **Dashboard** - Real-time statistics & charts
- **Management** - Users, Vendors, Drivers, Orders, Products
- **Analytics** - Revenue trends, performance metrics
- **Export** - PDF/CSV reports

## 🏗️ Tech Stack

### Backend
- Node.js 18+
- Express.js
- MongoDB 7.0
- Socket.io
- JWT Authentication
- Multer (file upload)
- Node-telegram-bot-api

### Frontend (Admin Panel)
- React 18
- Vite 5
- TailwindCSS 3
- React Router 6
- Axios
- Recharts
- Lucide Icons

### DevOps
- Docker & Docker Compose
- Nginx (reverse proxy)
- Redis (caching)
- Let's Encrypt (SSL)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 7.0+
- Docker & Docker Compose (optional)
- Telegram Bot Tokens (from @BotFather)

### Installation

#### Option 1: Docker (Recommended)

```bash
# Clone repository
git clone https://github.com/KBekmurod/parkent-expressV1.git
cd parkent-expressV1

# Configure environment
cp backend/.env.example backend/.env
cp admin-panel/.env.example admin-panel/.env

# Edit .env files with your values

# Start services
docker-compose up -d

# Access
# API: http://localhost:5000
# Admin: http://localhost:3000
```

#### Option 2: Manual Setup

**Backend:**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env file
npm run dev
```

**Admin Panel:**
```bash
cd admin-panel
npm install
cp .env.example .env
# Edit .env file
npm run dev
```

## 📁 Project Structure

```
parkent-expressV1/
├── backend/                    # Backend API
│   ├── src/
│   │   ├── config/            # Configuration
│   │   ├── controllers/       # Route controllers
│   │   ├── models/            # Mongoose models
│   │   ├── routes/            # API routes
│   │   ├── middleware/        # Express middleware
│   │   ├── utils/             # Utilities
│   │   ├── socket/            # Socket.io
│   │   └── bots/              # Telegram bots
│   │       ├── customer/      # Customer bot
│   │       ├── vendor/        # Vendor bot
│   │       └── driver/        # Driver bot
│   └── server.js              # Entry point
│
├── admin-panel/               # Admin Panel
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API services
│   │   ├── utils/             # Utilities
│   │   └── context/           # React context
│   └── vite.config.js
│
├── nginx/                     # Nginx configs
├── scripts/                   # Deployment scripts
└── docs/                      # Documentation
```

See [FOLDER_STRUCTURE.md](docs/FOLDER_STRUCTURE.md) for detailed structure.

## 📋 API Documentation

See [API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md) for complete API reference.

### Key Endpoints

```
POST   /api/v1/auth/register          # Register user
POST   /api/v1/auth/login             # Login
GET    /api/v1/vendors                # List vendors
POST   /api/v1/orders                 # Create order
GET    /api/v1/orders/:id/track       # Track order
PUT    /api/v1/orders/:id/status      # Update status
```

## 🤖 Telegram Bots

See [TELEGRAM_BOTS.md](docs/TELEGRAM_BOTS.md) for bot documentation.

### Setup Bot Tokens

1. Open Telegram and find @BotFather
2. Create 3 bots:
   - `/newbot` → Parkent Customer Bot
   - `/newbot` → Parkent Vendor Bot
   - `/newbot` → Parkent Driver Bot
3. Copy tokens to `.env` file

## ⚙️ Configuration

See [CONFIGURATION.md](docs/CONFIGURATION.md) for detailed configuration guide.

### Environment Variables

```env
# Backend .env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/parkent-express
JWT_SECRET=your-secret-key-min-32-characters
CUSTOMER_BOT_TOKEN=your_token_here
VENDOR_BOT_TOKEN=your_token_here
DRIVER_BOT_TOKEN=your_token_here
```

## 🐳 Docker Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment guide.

```bash
# Production deployment
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose logs -f

# Backup database
./scripts/backup.sh

# Restore database
./scripts/restore.sh ./backups/backup_file.archive
```

## 📊 Features Overview

### Customer Features
✅ Browse vendors by category  
✅ Search products  
✅ Add to cart  
✅ Place orders  
✅ Real-time order tracking  
✅ GPS tracking of driver  
✅ Order history  
✅ Review & ratings  

### Vendor Features
✅ Restaurant profile management  
✅ Menu management (add/edit/delete)  
✅ Order notifications  
✅ Accept/reject orders  
✅ Order status updates  
✅ Sales statistics  
✅ Review management  

### Driver Features
✅ Registration with vehicle info  
✅ Document upload  
✅ Online/offline status  
✅ Order assignments  
✅ GPS location tracking  
✅ Delivery confirmation  
✅ Earnings tracking  
✅ Payout requests  

### Admin Features
✅ Dashboard with analytics  
✅ User management  
✅ Vendor approval & management  
✅ Driver approval & management  
✅ Order monitoring  
✅ Product management  
✅ Revenue analytics  
✅ Export reports (PDF/CSV)  

## 🔐 Security

- JWT authentication
- Password hashing (bcrypt)
- Rate limiting
- CORS protection
- Helmet middleware
- Input validation
- SQL injection prevention (NoSQL)
- XSS protection

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

## 📈 Monitoring

- Health check endpoint: `/health`
- Docker healthchecks
- Log rotation
- Error tracking

## 🤝 Contributing

See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for contribution guidelines.

```bash
# Fork repository
# Create feature branch
git checkout -b feature/amazing-feature

# Commit changes
git commit -m 'Add amazing feature'

# Push to branch
git push origin feature/amazing-feature

# Open Pull Request
```

## 📜 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file.

## 👥 Authors

- **KBekmurod** - [GitHub](https://github.com/KBekmurod)

## 🙏 Acknowledgments

- Node.js community
- React community
- MongoDB team
- Telegram Bot API
- All open-source contributors

## 📞 Support

- Create an issue: [GitHub Issues](https://github.com/KBekmurod/parkent-expressV1/issues)
- Email: support@parkentexpress.com

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Payment gateway integration
- [ ] Multi-language support
- [ ] Push notifications
- [ ] Advanced analytics
- [ ] Loyalty program
- [ ] Promo codes system

---

**Built with ❤️ by KBekmurod**
