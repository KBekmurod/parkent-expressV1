# Setup Guide

Complete guide to set up Parkent Express development environment.

## Prerequisites

### Required Software
- **Node.js** 18.x or higher
- **MongoDB** 7.0 or higher
- **Git** 2.x or higher
- **Docker** (optional, but recommended)
- **Docker Compose** (optional, but recommended)

### Telegram Requirements
- Telegram account
- 3 Bot tokens from @BotFather

## Installation Methods

### Method 1: Docker Setup (Recommended)

#### 1. Clone Repository
```bash
git clone https://github.com/KBekmurod/parkent-expressV1.git
cd parkent-expressV1
```

#### 2. Configure Environment

**Backend:**
```bash
cd backend
cp .env.example .env
nano .env
```

Required variables:
```env
PORT=5000
MONGODB_URI=mongodb://mongo:27017/parkent-express
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
JWT_EXPIRE=7d

# Bot Tokens
CUSTOMER_BOT_TOKEN=your_customer_bot_token_here
VENDOR_BOT_TOKEN=your_vendor_bot_token_here
DRIVER_BOT_TOKEN=your_driver_bot_token_here

# Socket.io
SOCKET_PORT=5001

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

**Admin Panel:**
```bash
cd ../admin-panel
cp .env.example .env
nano .env
```

Required variables:
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5001
```

#### 3. Start Services
```bash
cd ..
docker-compose up -d
```

#### 4. Verify Services
```bash
# Check running containers
docker-compose ps

# View logs
docker-compose logs -f

# Test API
curl http://localhost:5000/health
```

#### 5. Access Applications
- **Backend API:** http://localhost:5000
- **Admin Panel:** http://localhost:3000
- **MongoDB:** localhost:27017

### Method 2: Manual Setup

#### 1. Clone Repository
```bash
git clone https://github.com/KBekmurod/parkent-expressV1.git
cd parkent-expressV1
```

#### 2. Install MongoDB

**Ubuntu/Debian:**
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0
```

#### 3. Setup Backend

```bash
cd backend
npm install
cp .env.example .env
nano .env
```

Configure environment variables (see Docker setup above for values).

Start backend:
```bash
npm run dev
```

Backend runs on http://localhost:5000

#### 4. Setup Admin Panel

Open new terminal:
```bash
cd admin-panel
npm install
cp .env.example .env
nano .env
```

Configure environment variables.

Start admin panel:
```bash
npm run dev
```

Admin panel runs on http://localhost:3000

## Telegram Bot Setup

### 1. Create Bots

Open Telegram and find **@BotFather**:

**Customer Bot:**
```
/newbot
Name: Parkent Customer Bot
Username: parkent_customer_bot (or your unique name)
```

**Vendor Bot:**
```
/newbot
Name: Parkent Vendor Bot
Username: parkent_vendor_bot
```

**Driver Bot:**
```
/newbot
Name: Parkent Driver Bot
Username: parkent_driver_bot
```

### 2. Configure Bot Settings

For each bot, set commands with @BotFather:

**Customer Bot Commands:**
```
/setcommands
start - Start the bot
menu - Browse vendors
cart - View cart
orders - Order history
track - Track order
profile - View profile
help - Get help
```

**Vendor Bot Commands:**
```
/setcommands
start - Register vendor
menu - Manage menu
orders - View orders
stats - View statistics
profile - Manage profile
help - Get help
```

**Driver Bot Commands:**
```
/setcommands
start - Register driver
online - Go online
offline - Go offline
deliveries - Available deliveries
earnings - View earnings
profile - Manage profile
help - Get help
```

### 3. Add Bot Tokens to .env

Copy the tokens from @BotFather to `backend/.env`:
```env
CUSTOMER_BOT_TOKEN=1234567890:ABCdef...
VENDOR_BOT_TOKEN=9876543210:XYZabc...
DRIVER_BOT_TOKEN=5555555555:QWErty...
```

### 4. Test Bots

Restart backend to load bot tokens:
```bash
cd backend
npm run dev
```

Open Telegram and send `/start` to each bot.

## Database Setup

### Create Initial Admin User

```bash
cd backend
node -e "
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
mongoose.connect('mongodb://localhost:27017/parkent-express');
const User = require('./src/models/User');

(async () => {
  const admin = await User.create({
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@parkentexpress.com',
    password: await bcrypt.hash('admin123', 10),
    phone: '+998901234567',
    role: 'admin',
    isActive: true,
    telegramId: null
  });
  console.log('Admin user created:', admin.email);
  process.exit(0);
})();
"
```

Or use the provided script:
```bash
npm run seed:admin
```

### Seed Sample Data (Optional)

```bash
npm run seed:categories
npm run seed:vendors
npm run seed:products
```

## Development Tools

### Recommended VS Code Extensions

- ESLint
- Prettier
- Docker
- MongoDB for VS Code
- Tailwind CSS IntelliSense
- ES7+ React/Redux snippets

### VS Code Settings

Create `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## Testing Setup

### Backend Tests

```bash
cd backend
npm install --save-dev jest supertest
npm test
```

### Frontend Tests

```bash
cd admin-panel
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest
npm test
```

## Troubleshooting

### MongoDB Connection Issues

**Error:** `MongoServerError: Authentication failed`

**Solution:**
```bash
# Remove authentication requirement for local dev
# Edit /etc/mongod.conf and comment out security section
sudo nano /etc/mongod.conf
sudo systemctl restart mongod
```

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:**
```bash
# Find process using port
lsof -i :5000
# Kill process
kill -9 <PID>
```

### Node Modules Issues

**Solution:**
```bash
# Clear npm cache
npm cache clean --force
# Remove node_modules
rm -rf node_modules package-lock.json
# Reinstall
npm install
```

### Docker Issues

**Solution:**
```bash
# Stop all containers
docker-compose down

# Remove volumes
docker-compose down -v

# Rebuild
docker-compose up --build
```

## Environment Variables Reference

### Backend .env

```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/parkent-express

# JWT
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRE=7d

# Bots
CUSTOMER_BOT_TOKEN=bot_token_here
VENDOR_BOT_TOKEN=bot_token_here
DRIVER_BOT_TOKEN=bot_token_here

# Socket.io
SOCKET_PORT=5001

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# CORS
FRONTEND_URL=http://localhost:3000

# Optional: Payment
PAYME_MERCHANT_ID=your_payme_id
CLICK_MERCHANT_ID=your_click_id
CLICK_SERVICE_ID=your_service_id
CLICK_SECRET_KEY=your_secret_key
```

### Admin Panel .env

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5001
```

## Next Steps

1. ✅ Setup complete
2. 📖 Read [API Documentation](API_DOCUMENTATION.md)
3. 🤖 Configure [Telegram Bots](TELEGRAM_BOTS.md)
4. ⚙️ Review [Configuration Guide](CONFIGURATION.md)
5. 🚀 Start developing!

## Getting Help

- 📖 Read documentation in `/docs`
- 🐛 Report issues on [GitHub](https://github.com/KBekmurod/parkent-expressV1/issues)
- 💬 Check existing issues for solutions
- 📧 Contact: support@parkentexpress.com

---

**Happy Coding! 🚀**
