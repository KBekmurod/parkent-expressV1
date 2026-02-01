# Parkent Express Deployment Guide

## Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- Git
- Domain name (for production)

## Development Setup

1. Clone repository:
```bash
git clone https://github.com/KBekmurod/parkent-expressV1.git
cd parkent-expressV1
```

2. Configure environment:
```bash
cp backend/.env.example backend/.env
cp admin-panel/.env.example admin-panel/.env
```

3. Start services:
```bash
docker compose up -d
```

4. Access:
- API: http://localhost:5000
- Admin: http://localhost:3000
- MongoDB: localhost:27017

## Production Deployment

1. Configure production environment:
```bash
cp backend/.env.production.example backend/.env.production
# Edit with production values
```

2. Set environment variables:
```bash
export MONGO_ROOT_USER=admin
export MONGO_ROOT_PASSWORD=secure_password
export REDIS_PASSWORD=redis_password
export API_URL=https://api.yourdomain.com/api/v1
```

3. Deploy:
```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

## SSL Setup (Let's Encrypt)

```bash
# Install certbot
docker compose run --rm certbot certonly --webroot \
  --webroot-path=/var/www/certbot \
  -d yourdomain.com -d www.yourdomain.com

# Update nginx config to use SSL
# Restart nginx
docker compose restart nginx
```

## Backup & Restore

Backup:
```bash
chmod +x scripts/backup.sh
./scripts/backup.sh
```

Restore:
```bash
chmod +x scripts/restore.sh
./scripts/restore.sh ./backups/parkent_backup_YYYYMMDD_HHMMSS.archive
```

## Monitoring

View logs:
```bash
docker compose logs -f [service_name]
```

Container status:
```bash
docker compose ps
```

## Troubleshooting

- Check container logs
- Verify environment variables
- Ensure ports are not in use
- Check MongoDB connection
- Verify Nginx configuration
