#!/bin/bash

# MongoDB Backup Script

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="parkent_backup_${TIMESTAMP}"

echo "🔄 Starting backup..."

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup MongoDB
docker exec parkent-mongo-prod mongodump \
  --archive=/data/db/${BACKUP_NAME}.archive \
  --gzip

# Copy backup from container
docker cp parkent-mongo-prod:/data/db/${BACKUP_NAME}.archive \
  ${BACKUP_DIR}/${BACKUP_NAME}.archive

# Remove backup from container
docker exec parkent-mongo-prod rm /data/db/${BACKUP_NAME}.archive

echo "✅ Backup completed: ${BACKUP_DIR}/${BACKUP_NAME}.archive"

# Keep only last 7 backups
cd $BACKUP_DIR
BACKUP_COUNT=$(ls -1 parkent_backup_*.archive 2>/dev/null | wc -l)
if [ "$BACKUP_COUNT" -gt 7 ]; then
    ls -t parkent_backup_*.archive | tail -n +8 | xargs rm -f
    echo "🧹 Old backups cleaned up"
fi
