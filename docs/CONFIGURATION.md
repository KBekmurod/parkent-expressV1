# Configuration Guide

Complete configuration reference for Parkent Express.

## Environment Variables

### Backend Configuration

#### Server Settings

```env
# Environment
NODE_ENV=development              # development | production | test

# Server Port
PORT=5000                         # Backend API port

# Base URL
BASE_URL=http://localhost:5000    # Full backend URL
```

#### Database Configuration

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/parkent-express

# Production with authentication
MONGODB_URI=mongodb://username:password@host:27017/parkent-express?authSource=admin

# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/parkent-express?retryWrites=true&w=majority
```

#### Authentication & Security

```env
# JWT Settings
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRE=7d                     # Token expiration (7d, 30d, etc.)
JWT_COOKIE_EXPIRE=7               # Cookie expiration in days

# Password Settings
BCRYPT_ROUNDS=10                  # Bcrypt salt rounds (default: 10)

# Rate Limiting
RATE_LIMIT_WINDOW=15              # Window in minutes
RATE_LIMIT_MAX=100                # Max requests per window
```

#### Telegram Bot Tokens

```env
# Bot Tokens from @BotFather
CUSTOMER_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
VENDOR_BOT_TOKEN=9876543210:XYZabcDEFghiJKLmnoPQRstuvw
DRIVER_BOT_TOKEN=5555555555:QWErtyUIOPasdfGHJKLzxcVBNM

# Bot Settings
BOT_WEBHOOK_DOMAIN=https://yourdomain.com   # For webhook mode (optional)
USE_WEBHOOK=false                            # true for webhook, false for polling
```

#### Socket.io Configuration

```env
# Socket.io Settings
SOCKET_PORT=5001                  # Socket.io port
SOCKET_CORS_ORIGIN=http://localhost:3000    # Allow CORS from admin panel
```

#### File Upload Settings

```env
# File Upload
MAX_FILE_SIZE=5242880             # 5MB in bytes
UPLOAD_PATH=./uploads             # Upload directory
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/jpg,application/pdf

# Image Settings
IMAGE_MAX_WIDTH=1920
IMAGE_MAX_HEIGHT=1080
IMAGE_QUALITY=80                  # JPEG quality (1-100)
```

#### Email Configuration (Optional)

```env
# Email Settings
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@parkentexpress.com
FROM_NAME=Parkent Express
```

#### Payment Gateway Configuration (Optional)

```env
# Payme
PAYME_MERCHANT_ID=your_payme_merchant_id
PAYME_SECRET_KEY=your_payme_secret_key
PAYME_ENDPOINT=https://checkout.paycom.uz

# Click
CLICK_MERCHANT_ID=your_click_merchant_id
CLICK_SERVICE_ID=your_click_service_id
CLICK_SECRET_KEY=your_click_secret_key
CLICK_ENDPOINT=https://api.click.uz/v2/merchant
```

#### External Services (Optional)

```env
# SMS Service (Playmobile/Eskiz)
SMS_PROVIDER=playmobile            # playmobile | eskiz
SMS_API_KEY=your_sms_api_key
SMS_FROM=Parkent                   # SMS sender name

# Google Maps API
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Firebase (for push notifications)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
```

#### CORS Configuration

```env
# CORS Settings
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000,https://yourdomain.com
```

#### Logging Configuration

```env
# Logging
LOG_LEVEL=info                    # error | warn | info | debug
LOG_FILE_PATH=./logs
LOG_MAX_SIZE=10m                  # Max log file size
LOG_MAX_FILES=7d                  # Keep logs for 7 days
```

### Admin Panel Configuration

#### API Configuration

```env
# Backend API
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5001

# Production
VITE_API_URL=https://api.parkentexpress.com/api/v1
VITE_SOCKET_URL=https://socket.parkentexpress.com
```

#### App Settings

```env
# App Configuration
VITE_APP_NAME=Parkent Express Admin
VITE_APP_VERSION=1.0.0

# Features
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_NOTIFICATIONS=true
```

## Configuration Files

### Backend package.json Scripts

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "seed:admin": "node scripts/seedAdmin.js",
    "seed:categories": "node scripts/seedCategories.js",
    "seed:all": "npm run seed:admin && npm run seed:categories"
  }
}
```

### Docker Configuration

#### docker-compose.yml (Development)

```yaml
version: '3.8'

services:
  mongo:
    image: mongo:7.0
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
    environment:
      MONGO_INITDB_DATABASE: parkent-express

  backend:
    build: ./backend
    ports:
      - "5000:5000"
      - "5001:5001"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/parkent-express
    depends_on:
      - mongo
    volumes:
      - ./backend:/app
      - /app/node_modules

  admin-panel:
    build: ./admin-panel
    ports:
      - "3000:3000"
    environment:
      - VITE_API_URL=http://localhost:5000/api/v1
    volumes:
      - ./admin-panel:/app
      - /app/node_modules

volumes:
  mongo-data:
```

#### docker-compose.prod.yml (Production)

```yaml
version: '3.8'

services:
  mongo:
    image: mongo:7.0
    restart: always
    volumes:
      - mongo-data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
      MONGO_INITDB_DATABASE: parkent-express
    networks:
      - app-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: always
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://admin:${MONGO_PASSWORD}@mongo:27017/parkent-express?authSource=admin
    depends_on:
      - mongo
    networks:
      - app-network

  admin-panel:
    build:
      context: ./admin-panel
      dockerfile: Dockerfile
    restart: always
    environment:
      - VITE_API_URL=${API_URL}
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    depends_on:
      - backend
      - admin-panel
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  mongo-data:
```

### Nginx Configuration

#### nginx/nginx.conf

```nginx
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:5000;
    }

    upstream admin {
        server admin-panel:3000;
    }

    # API Server
    server {
        listen 80;
        server_name api.parkentexpress.com;

        location / {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }

    # Admin Panel
    server {
        listen 80;
        server_name admin.parkentexpress.com;

        location / {
            proxy_pass http://admin;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
```

## MongoDB Configuration

### Create Database and User

```javascript
// Connect to MongoDB
mongosh

// Switch to admin database
use admin

// Create admin user
db.createUser({
  user: "admin",
  pwd: "secure_password",
  roles: ["root"]
})

// Create application database and user
use parkent-express

db.createUser({
  user: "parkent_user",
  pwd: "secure_password",
  roles: [
    { role: "readWrite", db: "parkent-express" }
  ]
})
```

### Indexes (Performance)

```javascript
// Users collection
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ telegramId: 1 })
db.users.createIndex({ role: 1 })

// Orders collection
db.orders.createIndex({ orderNumber: 1 }, { unique: true })
db.orders.createIndex({ customer: 1 })
db.orders.createIndex({ vendor: 1 })
db.orders.createIndex({ driver: 1 })
db.orders.createIndex({ status: 1 })
db.orders.createIndex({ createdAt: -1 })

// Products collection
db.products.createIndex({ vendor: 1 })
db.products.createIndex({ category: 1 })
db.products.createIndex({ "name.uz": "text", "name.ru": "text" })

// Vendors collection
db.vendors.createIndex({ status: 1 })
db.vendors.createIndex({ category: 1 })
db.vendors.createIndex({ "location.coordinates": "2dsphere" })
```

## Security Configuration

### SSL/TLS with Let's Encrypt

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d api.parkentexpress.com -d admin.parkentexpress.com

# Auto-renewal
sudo certbot renew --dry-run
```

### Firewall Configuration

```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp       # SSH
sudo ufw allow 80/tcp       # HTTP
sudo ufw allow 443/tcp      # HTTPS
sudo ufw enable
```

## Performance Optimization

### Node.js Production Settings

```env
# Production optimizations
NODE_ENV=production
NODE_OPTIONS=--max-old-space-size=4096
UV_THREADPOOL_SIZE=128
```

### PM2 Configuration (Alternative to Docker)

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'parkent-backend',
    script: './server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
};
```

Start with PM2:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Backup Configuration

### Automated MongoDB Backup Script

See `scripts/backup.sh` for automated backups.

Configure cron job:
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /path/to/scripts/backup.sh
```

## Monitoring Configuration

### Health Check Endpoint

Backend automatically provides `/health` endpoint:
```bash
curl http://localhost:5000/health
```

### Docker Health Checks

Already configured in `docker-compose.yml`:
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```

## Troubleshooting Configuration Issues

### Check Current Configuration

```bash
# Backend
cd backend
node -e "require('dotenv').config(); console.log(process.env)"

# List all environment variables
printenv | grep -i parkent
```

### Validate MongoDB Connection

```bash
node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));
"
```

### Test Bot Tokens

```bash
# Test bot token
curl https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getMe
```

## Additional Resources

- [MongoDB Configuration Docs](https://www.mongodb.com/docs/manual/reference/configuration-options/)
- [Nginx Configuration Guide](https://nginx.org/en/docs/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)

---

**Need help with configuration?** Open an issue on [GitHub](https://github.com/KBekmurod/parkent-expressV1/issues)
