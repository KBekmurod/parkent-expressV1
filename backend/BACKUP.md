# Database Backup & Restore Guide

## Overview

Automated MongoDB backup system with daily backups, 7-day retention, and easy restore.

---

## Automatic Backups

### Setup Automated Daily Backups

Run once:

```bash
cd backend
./scripts/setup-cron.sh
```

This will:
- Create a cron job for daily backups at 2:00 AM
- Log backups to `logs/backup.log`
- Keep backups for 7 days

### Verify Cron Job

```bash
crontab -l
```

You should see:
```
0 2 * * * cd /path/to/backend && ./scripts/backup-db.sh >> logs/backup.log 2>&1
```

---

## Manual Backup

### Create Backup Now

```bash
cd backend
./scripts/backup-db.sh
```

This will:
- Create a timestamped backup in `backups/`
- Compress the backup (`.tar.gz`)
- Remove backups older than 7 days
- Display backup size and list

Example output:
```
Starting MongoDB backup...
Creating backup: backup_20240115_143022
✓ Backup created successfully
✓ Backup compressed: backup_20240115_143022.tar.gz
Backup size: 2.3M
✓ Backup completed successfully
```

---

## Restore Database

### List Available Backups

```bash
cd backend
./scripts/restore-db.sh
```

This will show all available backups.

### Restore from Backup

```bash
cd backend
./scripts/restore-db.sh backup_20240115_143022.tar.gz
```

**WARNING:** This will overwrite the current database!

You'll be asked for confirmation:
```
WARNING: This will overwrite the current database!
Are you sure you want to restore from backup_20240115_143022.tar.gz? (yes/no):
```

Type `yes` to proceed.

---

## Backup Storage

### Location
- Backups: `backend/backups/`
- Logs: `backend/logs/backup.log`

### Retention
- Automatic: 7 days
- Manual: Keep as needed

### Backup Size
Typical backup size: 1-5 MB (compressed)

---

## Advanced Usage

### Change Backup Schedule

Edit cron job:
```bash
crontab -e
```

Change time (example: 3:00 AM):
```
0 3 * * * cd /path/to/backend && ./scripts/backup-db.sh >> logs/backup.log 2>&1
```

### Change Retention Period

Edit `scripts/backup-db.sh`:
```bash
RETENTION_DAYS=14  # Keep for 14 days
```

### Backup to Remote Location

Add to `scripts/backup-db.sh` (after compression):
```bash
# Copy to remote server
scp "$BACKUP_DIR/$BACKUP_NAME.tar.gz" user@remote:/backups/
```

### Backup Specific Database

Edit `scripts/backup-db.sh`:
```bash
mongodump --uri="$MONGODB_URI" --db=parkent-express --out="$BACKUP_DIR/$BACKUP_NAME"
```

---

## Troubleshooting

### Backup Fails

Check MongoDB connection:
```bash
mongo "$MONGODB_URI"
```

Check disk space:
```bash
df -h
```

### Cron Job Not Running

Check cron service:
```bash
sudo service cron status
```

View cron logs:
```bash
grep CRON /var/log/syslog
```

Check backup logs:
```bash
tail -f logs/backup.log
```

---

## Disaster Recovery

### Full System Restore

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment:
   ```bash
   cp .env.example .env
   nano .env
   ```

3. Restore database:
   ```bash
   ./scripts/restore-db.sh backup_latest.tar.gz
   ```

4. Start application:
   ```bash
   npm run prod
   ```

---

## Best Practices

✅ **Do:**
- Test restore process monthly
- Keep backups in multiple locations
- Monitor backup logs regularly
- Verify backup integrity

❌ **Don't:**
- Rely on only local backups
- Ignore backup failure notifications
- Store backups in same server as database
- Skip testing restore process

---

## Backup Checklist

- [ ] Automated backups configured (cron)
- [ ] Backup logs monitored
- [ ] Restore process tested
- [ ] Remote backup location configured (optional)
- [ ] Backup notifications setup (optional)
- [ ] Disaster recovery plan documented
