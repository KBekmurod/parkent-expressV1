#!/bin/bash

# Cron Job Setup Script
# Description: Sets up automated daily backups
# Usage: ./scripts/setup-cron.sh

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Get absolute path to backup script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKUP_SCRIPT="$SCRIPT_DIR/backup-db.sh"

echo -e "${YELLOW}Setting up automated daily backups...${NC}"

# Cron job: Daily at 2:00 AM
CRON_JOB="0 2 * * * cd $(dirname $SCRIPT_DIR) && $BACKUP_SCRIPT >> logs/backup.log 2>&1"

# Check if cron job already exists
(crontab -l 2>/dev/null | grep -F "$BACKUP_SCRIPT") && CRON_EXISTS=1 || CRON_EXISTS=0

if [ $CRON_EXISTS -eq 1 ]; then
  echo -e "${YELLOW}Cron job already exists. Updating...${NC}"
  # Remove old cron job
  crontab -l | grep -v "$BACKUP_SCRIPT" | crontab -
fi

# Add new cron job
(crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -

echo -e "${GREEN}✓ Cron job added successfully${NC}"
echo ""
echo -e "${GREEN}Backup schedule: Daily at 2:00 AM${NC}"
echo -e "${GREEN}Logs: logs/backup.log${NC}"
echo ""
echo -e "${YELLOW}Current crontab:${NC}"
crontab -l | grep "$BACKUP_SCRIPT"
echo ""
echo -e "${YELLOW}To remove cron job:${NC}"
echo "crontab -e  # then delete the backup line"
