#!/bin/bash

# MongoDB Backup Script
# Description: Creates timestamped MongoDB backups and removes old backups
# Usage: ./scripts/backup-db.sh

# Load environment variables
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Configuration
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="backup_$DATE"
RETENTION_DAYS=7

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting MongoDB backup...${NC}"

# Create backup directory if not exists
mkdir -p "$BACKUP_DIR"

# Check if MongoDB URI is set
if [ -z "$MONGODB_URI" ]; then
  echo -e "${RED}Error: MONGODB_URI not set in .env file${NC}"
  exit 1
fi

# Create backup
echo -e "${YELLOW}Creating backup: $BACKUP_NAME${NC}"
mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR/$BACKUP_NAME" --quiet

# Check if backup was successful
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Backup created successfully: $BACKUP_DIR/$BACKUP_NAME${NC}"
  
  # Compress backup
  echo -e "${YELLOW}Compressing backup...${NC}"
  cd "$BACKUP_DIR" && tar -czf "$BACKUP_NAME.tar.gz" "$BACKUP_NAME" && rm -rf "$BACKUP_NAME"
  cd ..
  echo -e "${GREEN}✓ Backup compressed: $BACKUP_NAME.tar.gz${NC}"
  
  # Calculate backup size
  BACKUP_SIZE=$(du -sh "$BACKUP_DIR/$BACKUP_NAME.tar.gz" | cut -f1)
  echo -e "${GREEN}Backup size: $BACKUP_SIZE${NC}"
  
  # Remove old backups
  echo -e "${YELLOW}Removing backups older than $RETENTION_DAYS days...${NC}"
  find "$BACKUP_DIR" -name "backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete
  
  # List current backups
  echo -e "${GREEN}Current backups:${NC}"
  ls -lh "$BACKUP_DIR"/*.tar.gz 2>/dev/null | awk '{print $9, $5}'
  
  echo -e "${GREEN}✓ Backup completed successfully${NC}"
else
  echo -e "${RED}✗ Backup failed${NC}"
  exit 1
fi
