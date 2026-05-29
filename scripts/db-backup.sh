#!/bin/bash

# Ensure backups directory exists
mkdir -p prisma/backups

echo "Backing up database to prisma/backups/base_save_point.sql..."
docker exec cuscobienestar-db pg_dump -U postgres -d cuscobienestar > prisma/backups/base_save_point.sql

echo "Backup complete!"
