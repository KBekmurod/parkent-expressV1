#!/bin/bash

# MongoDB Restore Script
# Description: Restores MongoDB from backup
# Usage: ./scripts/restore-db.sh [backup_name]

# Load environment variables
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Configuration
BACKUP_DIR="./backups"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if backup name provided
if [ -z "$1" ]; then
  echo -e "${YELLOW}Available backups:${NC}"
  ls -lh "$BACKUP_DIR"/*.tar.gz 2>/dev/null | awk '{print $9, $5}'
  echo ""
  echo -e "${YELLOW}Usage: ./scripts/restore-db.sh [backup_name]${NC}"
  echo -e "Example: ./scripts/restore-db.sh backup_20240115_120000.tar.gz"
  exit 1
fi

BACKUP_FILE="$BACKUP_DIR/$1"

# Check if backup exists
if [ ! -f "$BACKUP_FILE" ]; then
  echo -e "${RED}Error: Backup file not found: $BACKUP_FILE${NC}"
  exit 1
fi

# Check MongoDB URI
if [ -z "$MONGODB_URI" ]; then
  echo -e "${RED}Error: MONGODB_URI not set in .env file${NC}"
  exit 1
fi

# Warning
echo -e "${RED}WARNING: This will overwrite the current database!${NC}"
read -p "Are you sure you want to restore from $1? (yes/no): " -r
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
  echo -e "${YELLOW}Restore cancelled${NC}"
  exit 0
fi

# Extract backup
echo -e "${YELLOW}Extracting backup...${NC}"
TEMP_DIR="$BACKUP_DIR/temp_restore"
mkdir -p "$TEMP_DIR"
tar -xzf "$BACKUP_FILE" -C "$TEMP_DIR"

# Find backup directory
BACKUP_NAME=$(basename "$1" .tar.gz)
RESTORE_PATH="$TEMP_DIR/$BACKUP_NAME"

if [ ! -d "$RESTORE_PATH" ]; then
  echo -e "${RED}Error: Backup directory not found after extraction${NC}"
  rm -rf "$TEMP_DIR"
  exit 1
fi

# Restore database
echo -e "${YELLOW}Restoring database...${NC}"
mongorestore --uri="$MONGODB_URI" --drop "$RESTORE_PATH" --quiet

# Check result
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Database restored successfully from $1${NC}"
  rm -rf "$TEMP_DIR"
else
  echo -e "${RED}✗ Restore failed${NC}"
  rm -rf "$TEMP_DIR"
  exit 1
fi
