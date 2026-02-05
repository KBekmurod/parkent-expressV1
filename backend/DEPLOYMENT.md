# Production Deployment Guide

## Prerequisites

- Node.js 18+
- MongoDB running
- PM2 installed globally: `npm install -g pm2`

## Initial Setup

### 1. Install Dependencies

```bash
cd backend
npm install --production
```

### 2. Configure Environment

```bash
cp .env.example .env
nano .env
```

Set production values:
- `NODE_ENV=production`
- `MONGODB_URI=your_production_mongodb_uri`
- `JWT_SECRET=your_strong_secret_key`
- Bot tokens (from @BotFather)

### 3. Create Necessary Directories

```bash
mkdir -p logs
mkdir -p uploads/receipts
mkdir -p backups
```

### 4. Start Application with PM2

```bash
npm run prod
```

or

```bash
pm2 start ecosystem.config.js --env production
```

### 5. Save PM2 Process List

```bash
pm2 save
```

### 6. Setup PM2 Startup (Auto-start on Server Reboot)

```bash
pm2 startup
# Follow the instructions displayed
```

---

## PM2 Commands

### Start Application
```bash
pm2 start ecosystem.config.js --env production
# or
npm run prod
```

### Stop Application
```bash
pm2 stop parkent-express-backend
# or
npm run prod:stop
```

### Restart Application
```bash
pm2 restart parkent-express-backend
# or
npm run prod:restart
```

### View Logs
```bash
pm2 logs parkent-express-backend
# or
npm run prod:logs
```

### Monitor Resources
```bash
pm2 monit
# or
npm run prod:monit
```

### View Status
```bash
pm2 status
```

### Delete Process
```bash
pm2 delete parkent-express-backend
```

---

## Troubleshooting

### Application Won't Start

1. Check logs:
   ```bash
   pm2 logs parkent-express-backend --lines 100
   ```

2. Check environment variables:
   ```bash
   cat .env
   ```

3. Check MongoDB connection:
   ```bash
   mongo "your_mongodb_uri"
   ```

### High Memory Usage

PM2 will automatically restart if memory exceeds 1GB (configured in `ecosystem.config.js`).

To adjust:
```javascript
max_memory_restart: '2G'  // Change to 2GB
```

### Application Keeps Restarting

Check error logs:
```bash
cat logs/pm2-error.log
```

Common issues:
- MongoDB not running
- Incorrect environment variables
- Port already in use
- Missing dependencies

---

## Updating Application

### Pull Latest Code
```bash
git pull origin main
```

### Install Dependencies
```bash
npm install --production
```

### Restart Application
```bash
pm2 restart parkent-express-backend
```

---

## Monitoring

### Real-time Monitoring
```bash
pm2 monit
```

### Web-based Monitoring (Optional)

Install PM2 Plus:
```bash
pm2 install pm2-server-monit
```

---

## Security Checklist

- [ ] Change default JWT_SECRET
- [ ] Use strong MongoDB password
- [ ] Enable MongoDB authentication
- [ ] Configure firewall (allow only necessary ports)
- [ ] Use HTTPS (setup Nginx with SSL)
- [ ] Rotate bot tokens if compromised
- [ ] Regular security updates

---

## Performance Optimization

### Enable Cluster Mode (Optional)

For better performance, run multiple instances:

```javascript
// ecosystem.config.js
instances: 'max',  // or specific number like 2, 4
exec_mode: 'cluster'
```

**Note:** Be careful with Telegram bots in cluster mode - they may need special handling.

---

## Logs

Logs are stored in:
- PM2 error logs: `logs/pm2-error.log`
- PM2 output logs: `logs/pm2-out.log`
- Application logs: `logs/` (Winston)

To rotate logs:
```bash
pm2 install pm2-logrotate
```

---

## Backup & Restore

See [BACKUP.md](./BACKUP.md) for database backup instructions.
