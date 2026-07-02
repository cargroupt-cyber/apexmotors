# APEX Automotive — Backup Strategy

**Purpose:** Comprehensive backup and disaster recovery plan for the APEX Automotive platform.  
**Audience:** System administrators, DevOps engineers, technical stakeholders  
**Version:** 1.0  
**Last Updated:** January 2025

---

## Table of Contents

1. [Disaster Recovery Objectives](#1-disaster-recovery-objectives)
2. [Backup Types & Schedule](#2-backup-types--schedule)
3. [Database Backups](#3-database-backups)
4. [Image Backups](#4-image-backups)
5. [Application Code Backups](#5-application-code-backups)
6. [Configuration Backups](#6-configuration-backups)
7. [Off-Site Storage](#7-off-site-storage)
8. [Recovery Procedures](#8-recovery-procedures)
9. [Monitoring & Alerts](#9-monitoring--alerts)
10. [Testing Schedule](#10-testing-schedule)
11. [Backup Scripts](#11-backup-scripts)

---

## 1. Disaster Recovery Objectives

### Recovery Time Objective (RTO)

| Scenario | RTO | Description |
|----------|-----|-------------|
| **Database corruption** | 4 hours | Restore from last backup |
| **Complete server failure** | 8 hours | Rebuild + restore all data |
| **Accidental data deletion** | 2 hours | Point-in-time recovery |
| **Image storage failure** | 1 hour | Restore from Cloudinary/S3 |
| **DNS/Domain issue** | 30 minutes | Switch DNS or redeploy |

### Recovery Point Objective (RPO)

| Data Type | RPO | Backup Frequency |
|-----------|-----|-----------------|
| **Database** | 1 hour | Hourly incremental |
| **Images** | 24 hours | Daily sync |
| **Configuration** | 24 hours | Daily + version control |
| **Application code** | 0 (instant) | Git repository |

---

## 2. Backup Types & Schedule

### Backup Schedule Overview

| Type | Frequency | Retention | Storage Location |
|------|-----------|-----------|-----------------|
| **Database — Full** | Daily at 02:00 UTC | 30 days | S3 + local |
| **Database — Incremental** | Hourly | 7 days | S3 |
| **Database — Weekly Archive** | Sundays at 03:00 UTC | 12 months | S3 Glacier |
| **Database — Monthly Archive** | 1st of month at 04:00 UTC | 7 years | S3 Glacier Deep |
| **Images** | Daily sync | 30 days | S3 + Cloudinary |
| **Configuration** | Daily | 90 days | Git + S3 |
| **Application Code** | Every push | Indefinite | GitHub |

### Backup Calendar

```
Sunday    02:00  Full DB backup + Weekly archive
          03:00  Image sync + Config backup
Monday    02:00  Full DB backup
Tuesday   02:00  Full DB backup
Wednesday 02:00  Full DB backup
Thursday  02:00  Full DB backup
Friday    02:00  Full DB backup
Saturday  02:00  Full DB backup
Daily     :00    Hourly incremental DB backup (every hour)
Monthly   04:00  Monthly archive (1st of month)
```

---

## 3. Database Backups

### 3.1 PostgreSQL Full Backup (pg_dump)

```bash
#!/bin/bash
# /opt/apex/scripts/backup-database.sh

set -euo pipefail

# Configuration
DB_NAME="apex_automotive"
DB_USER="apex_backup"
BACKUP_DIR="/var/backups/apex/database"
S3_BUCKET="s3://apex-automotive-backups/database"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/apex_db_${DATE}.sql"
COMPRESSED_FILE="${BACKUP_FILE}.gz"
RETENTION_DAYS=30

# Create backup directory
mkdir -p "${BACKUP_DIR}"

echo "[$(date)] Starting database backup..."

# Perform pg_dump with custom format
pg_dump \
  --host="${DB_HOST:-localhost}" \
  --port="${DB_PORT:-5432}" \
  --username="${DB_USER}" \
  --dbname="${DB_NAME}" \
  --format=custom \
  --verbose \
  --file="${BACKUP_FILE}"

# Compress backup
echo "[$(date)] Compressing backup..."
gzip -c "${BACKUP_FILE}" > "${COMPRESSED_FILE}"
rm "${BACKUP_FILE}"

# Calculate size
BACKUP_SIZE=$(du -h "${COMPRESSED_FILE}" | cut -f1)
echo "[$(date)] Backup complete: ${COMPRESSED_FILE} (${BACKUP_SIZE})"

# Upload to S3
echo "[$(date)] Uploading to S3..."
aws s3 cp "${COMPRESSED_FILE}" "${S3_BUCKET}/daily/" --storage-class STANDARD_IA

# Verify upload
if aws s3 ls "${S3_BUCKET}/daily/$(basename ${COMPRESSED_FILE})" > /dev/null 2>&1; then
  echo "[$(date)] Upload verified successfully"
else
  echo "[$(date)] ERROR: Upload verification failed!"
  exit 1
fi

# Clean up local backups older than retention period
echo "[$(date)] Cleaning up old local backups..."
find "${BACKUP_DIR}" -name "apex_db_*.sql.gz" -mtime +${RETENTION_DAYS} -delete

# Clean up old S3 backups
aws s3 ls "${S3_BUCKET}/daily/" | \
  awk '{print $4}' | \
  while read file; do
    file_date=$(echo $file | grep -oP '\d{8}')
    cutoff_date=$(date -d "${RETENTION_DAYS} days ago" +%Y%m%d)
    if [[ $file_date < $cutoff_date ]]; then
      aws s3 rm "${S3_BUCKET}/daily/${file}"
      echo "[$(date)] Deleted old backup: ${file}"
    fi
  done

echo "[$(date)] Database backup process complete."
```

### 3.2 PostgreSQL Incremental Backup (WAL Archiving)

```bash
#!/bin/bash
# /opt/apex/scripts/backup-incremental.sh

# Enable WAL archiving in postgresql.conf:
# wal_level = replica
# archive_mode = on
# archive_command = 'cp %p /var/backups/apex/wal/%f'
# max_wal_size = 1GB

WAL_DIR="/var/backups/apex/wal"
S3_BUCKET="s3://apex-automotive-backups/wal"

# Archive WAL files to S3
find "${WAL_DIR}" -name "*.backup" -o -name "*.partial" | while read wal; do
  aws s3 cp "${wal}" "${S3_BUCKET}/" --storage-class STANDARD
  rm "${wal}"
done

# For point-in-time recovery, you need:
# 1. A base backup (pg_dump or pg_basebackup)
# 2. Continuous WAL archiving
# 3. recovery.conf with restore_command
```

### 3.3 Point-in-Time Recovery (PITR)

```bash
#!/bin/bash
# /opt/apex/scripts/restore-pitr.sh

# Restore database to a specific point in time
# Usage: ./restore-pitr.sh "2025-01-20 14:30:00"

TARGET_TIME="${1}"
RESTORE_DIR="/var/lib/postgresql/restore"
BACKUP_BUCKET="s3://apex-automotive-backups/database"

# Stop PostgreSQL
systemctl stop postgresql

# Clean old data
mv /var/lib/postgresql/data /var/lib/postgresql/data.old
mkdir -p /var/lib/postgresql/data

# Download latest base backup
LATEST_BACKUP=$(aws s3 ls "${BACKUP_BUCKET}/daily/" | sort | tail -n 1 | awk '{print $4}')
aws s3 cp "${BACKUP_BUCKET}/daily/${LATEST_BACKUP}" /tmp/

# Restore base backup
gunzip -c "/tmp/${LATEST_BACKUP}" | pg_restore --dbname=apex_automotive

# Configure recovery
cat > /var/lib/postgresql/data/recovery.conf <<EOF
restore_command = 'aws s3 cp s3://apex-automotive-backups/wal/%f %p'
recovery_target_time = '${TARGET_TIME}'
recovery_target_action = 'promote'
EOF

# Start PostgreSQL
systemctl start postgresql

echo "Point-in-time recovery to ${TARGET_TIME} initiated."
echo "Monitor logs: journalctl -u postgresql -f"
```

### 3.4 Weekly Archive Backup

```bash
#!/bin/bash
# /opt/apex/scripts/backup-weekly.sh

# Sunday 03:00 UTC — Move daily backup to long-term storage

SOURCE_BUCKET="s3://apex-automotive-backups/database/daily"
DEST_BUCKET="s3://apex-automotive-backups/database/weekly"
DATE=$(date +%Y%m%d)

# Find Sunday's daily backup and copy to weekly with Glacier storage
SUNDAY_BACKUP=$(aws s3 ls "${SOURCE_BUCKET}/" | grep "${DATE}" | awk '{print $4}')

if [ -n "${SUNDAY_BACKUP}" ]; then
  aws s3 cp "${SOURCE_BUCKET}/${SUNDAY_BACKUP}" "${DEST_BUCKET}/${SUNDAY_BACKUP}" --storage-class GLACIER
  echo "[$(date)] Weekly archive created: ${SUNDAY_BACKUP}"
fi

# Clean weekly backups older than 12 months
CUTOFF=$(date -d "12 months ago" +%Y%m%d)
aws s3 ls "${DEST_BUCKET}/" | while read line; do
  FILE_DATE=$(echo $line | grep -oP 'apex_db_\K\d{8}')
  if [[ "${FILE_DATE}" < "${CUTOFF}" ]]; then
    FILE=$(echo $line | awk '{print $4}')
    aws s3 rm "${DEST_BUCKET}/${FILE}"
  fi
done
```

---

## 4. Image Backups

### 4.1 Cloudinary Backup

Cloudinary provides built-in backup for paid plans. For additional safety:

```bash
#!/bin/bash
# /opt/apex/scripts/backup-images.sh

# Sync all images from Cloudinary to S3
# Requires cloudinary-cli: npm install -g cloudinary-cli

CLOUD_NAME="${CLOUDINARY_CLOUD_NAME}"
S3_BUCKET="s3://apex-automotive-backups/images"
DATE=$(date +%Y%m%d)
BACKUP_DIR="/var/backups/apex/images/${DATE}"

mkdir -p "${BACKUP_DIR}"

echo "[$(date)] Starting image backup..."

# List all resources and download
cld -c "${CLOUD_NAME}" admin assets --max_results 500 > "${BACKUP_DIR}/manifest.json"

# Download all original images
cld -c "${CLOUD_NAME}" download --prefix "apex_automotive" --output "${BACKUP_DIR}/"

# Sync to S3
aws s3 sync "${BACKUP_DIR}/" "${S3_BUCKET}/${DATE}/" --storage-class STANDARD_IA

# Clean local copies older than 7 days
find "/var/backups/apex/images/" -maxdepth 1 -type d -mtime +7 -exec rm -rf {} \;

# Clean S3 copies older than 30 days
aws s3 ls "${S3_BUCKET}/" | while read line; do
  FOLDER=$(echo $line | awk '{print $2}' | sed 's|/||')
  FOLDER_DATE=$(echo $FOLDER | grep -oP '^\d{8}')
  CUTOFF=$(date -d "30 days ago" +%Y%m%d)
  if [[ "${FOLDER_DATE}" < "${CUTOFF}" ]]; then
    aws s3 rm "${S3_BUCKET}/${FOLDER}" --recursive
  fi
done

echo "[$(date)] Image backup complete."
```

### 4.2 Raw Image Backup

Store original unprocessed images separately:

```bash
#!/bin/bash
# /opt/apex/scripts/backup-raw-images.sh

S3_RAW_BUCKET="s3://apex-automotive-backups/images-raw"
LOCAL_UPLOAD_DIR="/var/www/apex-automotive/uploads"

# Sync raw uploads to S3
aws s3 sync "${LOCAL_UPLOAD_DIR}/" "${S3_RAW_BUCKET}/" --storage-class STANDARD_IA

echo "[$(date)] Raw image sync complete."
```

---

## 5. Application Code Backups

### Git-Based Backup

The application code is backed up through Git:

| Repository | Platform | Backup Method |
|------------|----------|---------------|
| Frontend | GitHub | GitHub's built-in redundancy + local mirror |
| Backend API | GitHub | GitHub's built-in redundancy + local mirror |
| Infrastructure | GitHub | Terraform configs, Docker files |

### Local Git Mirror

```bash
#!/bin/bash
# /opt/apex/scripts/backup-git.sh

# Create local mirrors of all repositories
REPOS=(
  "https://github.com/your-org/apex-automotive-web"
  "https://github.com/your-org/apex-automotive-api"
  "https://github.com/your-org/apex-automotive-infra"
)

BACKUP_DIR="/var/backups/apex/git"
mkdir -p "${BACKUP_DIR}"

for REPO in "${REPOS[@]}"; do
  REPO_NAME=$(basename "${REPO}" .git)
  REPO_DIR="${BACKUP_DIR}/${REPO_NAME}"

  if [ -d "${REPO_DIR}" ]; then
    cd "${REPO_DIR}" && git fetch --all
  else
    git clone --mirror "${REPO}" "${REPO_DIR}"
  fi

echo "[$(date)] Git backup updated: ${REPO_NAME}"
done
```

---

## 6. Configuration Backups

### Environment & Configuration Files

```bash
#!/bin/bash
# /opt/apex/scripts/backup-config.sh

CONFIG_BACKUP_DIR="/var/backups/apex/config"
S3_BUCKET="s3://apex-automotive-backups/config"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p "${CONFIG_BACKUP_DIR}"

# Backup environment files
cp /var/www/apex-automotive/.env "${CONFIG_BACKUP_DIR}/.env.${DATE}"

# Backup Nginx config
cp -r /etc/nginx/sites-available "${CONFIG_BACKUP_DIR}/nginx-${DATE}"

# Backup SSL certificates
cp -r /etc/letsencrypt "${CONFIG_BACKUP_DIR}/ssl-${DATE}"

# Backup systemd service files
cp /etc/systemd/system/apex-automotive.service "${CONFIG_BACKUP_DIR}/"

# Backup PostgreSQL config
cp /etc/postgresql/*/main/postgresql.conf "${CONFIG_BACKUP_DIR}/postgresql.conf.${DATE}"
cp /etc/postgresql/*/main/pg_hba.conf "${CONFIG_BACKUP_DIR}/pg_hba.conf.${DATE}"

# Backup Redis config
cp /etc/redis/redis.conf "${CONFIG_BACKUP_DIR}/redis.conf.${DATE}"

# Compress and upload
tar -czf "${CONFIG_BACKUP_DIR}/config-${DATE}.tar.gz" -C "${CONFIG_BACKUP_DIR}" "${DATE}"
aws s3 cp "${CONFIG_BACKUP_DIR}/config-${DATE}.tar.gz" "${S3_BUCKET}/" --storage-class STANDARD_IA

# Clean local
rm -rf "${CONFIG_BACKUP_DIR}/${DATE}" "${CONFIG_BACKUP_DIR}/config-${DATE}.tar.gz"
rm "${CONFIG_BACKUP_DIR}/.env.${DATE}"

# Clean S3 older than 90 days
CUTOFF=$(date -d "90 days ago" +%Y%m%d)
aws s3 ls "${S3_BUCKET}/" | while read line; do
  FILE_DATE=$(echo $line | grep -oP 'config-\K\d{8}')
  if [[ "${FILE_DATE}" < "${CUTOFF}" ]]; then
    FILE=$(echo $line | awk '{print $4}')
    aws s3 rm "${S3_BUCKET}/${FILE}"
  fi
done

echo "[$(date)] Configuration backup complete."
```

---

## 7. Off-Site Storage

### Storage Architecture

```
Primary (London)                    Secondary (Ireland)
┌─────────────────┐                ┌─────────────────┐
│ PostgreSQL DB   │───────────────▶│ S3 Bucket       │
│ Local backups   │  Daily sync    │ (Cross-region   │
│                 │                │  replication)   │
└─────────────────┘                └─────────────────┘
       │                                    │
       ▼                                    ▼
┌─────────────────┐                ┌─────────────────┐
│ Cloudinary CDN  │                │ AWS S3 Glacier  │
│ (Image storage) │                │ (Long-term      │
│                 │                │  archive)       │
└─────────────────┘                └─────────────────┘
```

### S3 Bucket Configuration

```bash
# Create backup bucket with versioning and encryption
aws s3api create-bucket \
  --bucket apex-automotive-backups \
  --region eu-west-1 \
  --create-bucket-configuration LocationConstraint=eu-west-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket apex-automotive-backups \
  --versioning-configuration Status=Enabled

# Enable server-side encryption
aws s3api put-bucket-encryption \
  --bucket apex-automotive-backups \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      },
      "BucketKeyEnabled": true
    }]
  }'

# Block public access
aws s3api put-public-access-block \
  --bucket apex-automotive-backups \
  --public-access-block-configuration \
    BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true

# Lifecycle policy
aws s3api put-bucket-lifecycle-configuration \
  --bucket apex-automotive-backups \
  --lifecycle-configuration file://lifecycle.json
```

### Lifecycle Policy

```json
{
  "Rules": [
    {
      "ID": "TransitionDailyToIA",
      "Status": "Enabled",
      "Filter": {
        "Prefix": "database/daily/"
      },
      "Transitions": [
        {
          "Days": 30,
          "StorageClass": "STANDARD_IA"
        },
        {
          "Days": 90,
          "StorageClass": "GLACIER"
        }
      ],
      "Expiration": {
        "Days": 365
      }
    },
    {
      "ID": "WeeklyGlacier",
      "Status": "Enabled",
      "Filter": {
        "Prefix": "database/weekly/"
      },
      "Transitions": [
        {
          "Days": 1,
          "StorageClass": "GLACIER"
        }
      ],
      "Expiration": {
        "Days": 365
      }
    },
    {
      "ID": "MonthlyDeepArchive",
      "Status": "Enabled",
      "Filter": {
        "Prefix": "database/monthly/"
      },
      "Transitions": [
        {
          "Days": 1,
          "StorageClass": "DEEP_ARCHIVE"
        }
      ],
      "Expiration": {
        "Days": 2555
      }
    }
  ]
}
```

---

## 8. Recovery Procedures

### 8.1 Database Recovery — Full Restore

```bash
#!/bin/bash
# /opt/apex/scripts/recover-database.sh

# Restore database from backup
# Usage: ./recover-database.sh <backup-file>

BACKUP_FILE="${1}"
DB_NAME="apex_automotive"
DB_USER="postgres"

if [ -z "${BACKUP_FILE}" ]; then
  echo "Usage: $0 <backup-file>"
  echo "Available backups:"
  aws s3 ls s3://apex-automotive-backups/database/daily/ | tail -n 10
  exit 1
fi

echo "!!! DATABASE RECOVERY !!!"
echo "This will REPLACE the current database."
read -p "Are you sure? Type 'RECOVER' to continue: " CONFIRM

if [ "${CONFIRM}" != "RECOVER" ]; then
  echo "Recovery cancelled."
  exit 1
fi

# Download from S3 if needed
if [[ "${BACKUP_FILE}" == s3://* ]]; then
  LOCAL_FILE="/tmp/$(basename ${BACKUP_FILE})"
  aws s3 cp "${BACKUP_FILE}" "${LOCAL_FILE}"
  BACKUP_FILE="${LOCAL_FILE}"
fi

# Stop application
systemctl stop apex-automotive

# Drop and recreate database
echo "Dropping current database..."
sudo -u postgres psql -c "DROP DATABASE IF EXISTS ${DB_NAME};"
sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME};"

# Restore
echo "Restoring from backup..."
if [[ "${BACKUP_FILE}" == *.gz ]]; then
  gunzip -c "${BACKUP_FILE}" | sudo -u postgres psql -d "${DB_NAME}"
else
  sudo -u postgres pg_restore -d "${DB_NAME}" "${BACKUP_FILE}"
fi

# Verify
TABLE_COUNT=$(sudo -u postgres psql -d "${DB_NAME}" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
echo "Restored database has ${TABLE_COUNT} tables."

# Restart application
systemctl start apex-automotive

echo "Database recovery complete."
echo "Verify application: https://apexautomotive.co.uk/health"
```

### 8.2 Image Recovery

```bash
#!/bin/bash
# /opt/apex/scripts/recover-images.sh

# Restore images from S3 backup to Cloudinary
# This re-uploads images if Cloudinary data is lost

S3_BUCKET="s3://apex-automotive-backups/images"
RESTORE_DATE="${1:-$(date +%Y%m%d)}"
TEMP_DIR="/tmp/image-restore-${RESTORE_DATE}"

# Download from S3
aws s3 sync "${S3_BUCKET}/${RESTORE_DATE}/" "${TEMP_DIR}/"

# Re-upload to Cloudinary
find "${TEMP_DIR}" -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.webp" \) | while read img; do
  # Extract vehicle ID from path
  VEHICLE_ID=$(echo "${img}" | grep -oP 'vehicles/\K[^/]+')

  if [ -n "${VEHICLE_ID}" ]; then
    # Upload with correct folder structure
    curl -X POST \
      "https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload" \
      -F "file=@${img}" \
      -F "folder=apex_automotive/vehicles/${VEHICLE_ID}" \
      -F "api_key=${CLOUDINARY_API_KEY}" \
      -F "timestamp=$(date +%s)" \
      -F "signature=${SIGNATURE}"
  fi
done

rm -rf "${TEMP_DIR}"
echo "Image recovery complete."
```

### 8.3 Complete Server Recovery

```bash
#!/bin/bash
# /opt/apex/scripts/recover-server.sh

# Complete server rebuild procedure
# Assumes: New Ubuntu 22.04 server, same architecture

echo "=== APEX AUTOMOTIVE SERVER RECOVERY ==="

# 1. System setup
echo "Step 1: System setup..."
apt update && apt upgrade -y
apt install -y curl git nginx postgresql redis-server awscli

# 2. Restore configuration
echo "Step 2: Restoring configuration..."
LATEST_CONFIG=$(aws s3 ls s3://apex-automotive-backups/config/ | sort | tail -n 1 | awk '{print $4}')
aws s3 cp "s3://apex-automotive-backups/config/${LATEST_CONFIG}" /tmp/
tar -xzf "/tmp/${LATEST_CONFIG}" -C /tmp/config/

# Restore configs
cp -r /tmp/config/*/nginx-*/* /etc/nginx/sites-available/
cp -r /tmp/config/*/ssl-*/* /etc/letsencrypt/
cp /tmp/config/*/.env.* /var/www/apex-automotive/.env

# 3. Restore database
echo "Step 3: Restoring database..."
LATEST_DB=$(aws s3 ls s3://apex-automotive-backups/database/daily/ | sort | tail -n 1 | awk '{print $4}')
aws s3 cp "s3://apex-automotive-backups/database/daily/${LATEST_DB}" /tmp/
./recover-database.sh "/tmp/${LATEST_DB}"

# 4. Deploy application
echo "Step 4: Deploying application..."
git clone https://github.com/your-org/apex-automotive.git /var/www/apex-automotive
cd /var/www/apex-automotive
npm install
npm run build

# 5. Restore images
echo "Step 5: Restoring images..."
./recover-images.sh

# 6. Start services
echo "Step 6: Starting services..."
systemctl restart postgresql
systemctl restart redis
systemctl restart nginx
pm2 start ecosystem.config.js

echo "=== RECOVERY COMPLETE ==="
echo "Verify: curl https://apexautomotive.co.uk/health"
```

---

## 9. Monitoring & Alerts

### Backup Monitoring Script

```bash
#!/bin/bash
# /opt/apex/scripts/monitor-backups.sh

# Check backup health and alert on issues

S3_BUCKET="s3://apex-automotive-backups"
ALERT_EMAIL="admin@apexautomotive.co.uk"
WEBHOOK_URL="${SLACK_WEBHOOK_URL}"
ERRORS=()

# Check last database backup
LAST_DB_BACKUP=$(aws s3 ls "${S3_BUCKET}/database/daily/" | sort | tail -n 1)
LAST_DB_DATE=$(echo "${LAST_DB_BACKUP}" | awk '{print $1}')
TODAY=$(date +%Y-%m-%d)

if [ "${LAST_DB_DATE}" != "${TODAY}" ]; then
  ERRORS+=("Database backup missing for today. Last: ${LAST_DB_DATE}")
fi

# Check backup file size (should be > 1MB)
LAST_DB_SIZE=$(echo "${LAST_DB_BACKUP}" | awk '{print $3}')
if [ "${LAST_DB_SIZE}" -lt 1048576 ]; then
  ERRORS+=("Database backup suspiciously small: ${LAST_DB_SIZE} bytes")
fi

# Check WAL archiving
WAL_COUNT=$(aws s3 ls "${S3_BUCKET}/wal/" | wc -l)
if [ "${WAL_COUNT}" -lt 10 ]; then
  ERRORS+=("Low WAL file count: ${WAL_COUNT} (possible archiving issue)")
fi

# Check image backup
LAST_IMG_BACKUP=$(aws s3 ls "${S3_BUCKET}/images/" | sort | tail -n 1)
if [ -z "${LAST_IMG_BACKUP}" ]; then
  ERRORS+=("No image backups found!")
fi

# Send alerts if errors found
if [ ${#ERRORS[@]} -gt 0 ]; then
  MESSAGE="BACKUP ALERT for APEX Automotive:\n"
  for error in "${ERRORS[@]}"; do
    MESSAGE+="- ${error}\n"
  done

  # Email alert
  echo -e "${MESSAGE}" | mail -s "APEX Backup Alert" "${ALERT_EMAIL}"

  # Slack alert
  curl -X POST -H 'Content-type: application/json' \
    --data "{\"text\":\"${MESSAGE}\"}" \
    "${WEBHOOK_URL}"

  echo "[$(date)] ALERTS SENT: ${#ERRORS[@]} issues found"
  exit 1
else
  echo "[$(date)] All backups healthy."
  exit 0
fi
```

### Alert Conditions

| Condition | Severity | Action |
|-----------|----------|--------|
| No backup in last 24 hours | Critical | Immediate email + Slack |
| Backup file size < 1MB | Critical | Immediate email + Slack |
| S3 upload failure | Critical | Immediate email + Slack |
| WAL archiving stopped | High | Email within 1 hour |
| Backup older than 48 hours | Critical | Immediate email + Slack |
| Image backup missing | Medium | Daily digest |

---

## 10. Testing Schedule

### Recovery Testing

| Test Type | Frequency | Last Tested | Next Test |
|-----------|-----------|-------------|-----------|
| Database restore (dry run) | Weekly | — | — |
| Full database restore (test env) | Monthly | — | — |
| Point-in-time recovery | Monthly | — | — |
| Image recovery | Quarterly | — | — |
| Complete server rebuild | Semi-annually | — | — |
| Backup integrity check | Weekly | — | — |

### Testing Procedure

```bash
#!/bin/bash
# /opt/apex/scripts/test-recovery.sh

# Automated recovery test (runs on staging environment)

STAGING_DB="apex_automotive_staging"
TEST_RESULTS="/var/log/apex/recovery-tests.log"

# 1. Test database restore
echo "[$(date)] Testing database restore..." >> "${TEST_RESULTS}"
LATEST_BACKUP=$(aws s3 ls s3://apex-automotive-backups/database/daily/ | sort | tail -n 1 | awk '{print $4}')

sudo -u postgres psql -c "DROP DATABASE IF EXISTS ${STAGING_DB};"
sudo -u postgres psql -c "CREATE DATABASE ${STAGING_DB};"

aws s3 cp "s3://apex-automotive-backups/database/daily/${LATEST_BACKUP}" /tmp/
gunzip -c "/tmp/${LATEST_BACKUP}" | sudo -u postgres psql -d "${STAGING_DB}"

# Verify
TABLE_COUNT=$(sudo -u postgres psql -d "${STAGING_DB}" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
if [ "${TABLE_COUNT}" -gt 0 ]; then
  echo "[$(date)] PASS: Database restore successful (${TABLE_COUNT} tables)" >> "${TEST_RESULTS}"
else
  echo "[$(date)] FAIL: Database restore failed (0 tables)" >> "${TEST_RESULTS}"
fi

# 2. Test backup integrity
echo "[$(date)] Testing backup integrity..." >> "${TEST_RESULTS}"
if gunzip -t "/tmp/${LATEST_BACKUP}" 2>/dev/null; then
  echo "[$(date)] PASS: Backup file integrity OK" >> "${TEST_RESULTS}"
else
  echo "[$(date)] FAIL: Backup file corrupted!" >> "${TEST_RESULTS}"
fi

# Cleanup
sudo -u postgres psql -c "DROP DATABASE IF EXISTS ${STAGING_DB};"
rm "/tmp/${LATEST_BACKUP}"

echo "[$(date)] Recovery test complete." >> "${TEST_RESULTS}"
```

---

## 11. Backup Scripts

### Complete Cron Configuration

```bash
# /etc/cron.d/apex-backups
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin
MAILTO="admin@apexautomotive.co.uk"

# Database backups
0 2 * * * root /opt/apex/scripts/backup-database.sh >> /var/log/apex/backup-db.log 2>&1
0 * * * * root /opt/apex/scripts/backup-incremental.sh >> /var/log/apex/backup-incr.log 2>&1
0 3 * * 0 root /opt/apex/scripts/backup-weekly.sh >> /var/log/apex/backup-weekly.log 2>&1
0 4 1 * * root /opt/apex/scripts/backup-monthly.sh >> /var/log/apex/backup-monthly.log 2>&1

# Image backups
0 3 * * * root /opt/apex/scripts/backup-images.sh >> /var/log/apex/backup-images.log 2>&1
0 4 * * * root /opt/apex/scripts/backup-raw-images.sh >> /var/log/apex/backup-raw.log 2>&1

# Configuration backups
0 5 * * * root /opt/apex/scripts/backup-config.sh >> /var/log/apex/backup-config.log 2>&1

# Git backups
0 6 * * * root /opt/apex/scripts/backup-git.sh >> /var/log/apex/backup-git.log 2>&1

# Monitoring
0 8 * * * root /opt/apex/scripts/monitor-backups.sh >> /var/log/apex/backup-monitor.log 2>&1

# Recovery testing (Sundays at 10 AM)
0 10 * * 0 root /opt/apex/scripts/test-recovery.sh >> /var/log/apex/recovery-test.log 2>&1
```

### Log Rotation

```bash
# /etc/logrotate.d/apex-backups
/var/log/apex/*.log {
  daily
  missingok
  rotate 30
  compress
  delaycompress
  notifempty
  create 0640 root root
}
```

---

**Document Version:** 1.0  
**Last Updated:** January 2025
