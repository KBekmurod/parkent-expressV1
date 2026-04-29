#!/bin/bash

# MongoDB Restore Script

if [ -z "$1" ]; then
    echo "Usage: ./restore.sh <backup_file>"
    exit 1
fi

BACKUP_FILE=$1

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "🔄 Starting restore from: $BACKUP_FILE"

# Copy backup to container
docker cp $BACKUP_FILE parkent-mongo-prod:/tmp/backup.archive

# Restore MongoDB
docker exec parkent-mongo-prod mongorestore \
  --archive=/tmp/backup.archive \
  --gzip \
  --drop

# Remove backup from container
docker exec parkent-mongo-prod rm /tmp/backup.archive

echo "✅ Restore completed"
