#!/bin/bash

# Script to apply Phase 3 database schema to qual environment via SSH
# This script runs locally and executes commands on the remote server

echo "🔧 Phase 3 Database Schema Application"
echo "======================================"
echo

# Server details
SSH_USER="adam"
SSH_HOST="manylla.com"
REMOTE_PATH="/home/stachblx/public_html/qual/api/sync"
DB_USER="stachblx_manyqual"
DB_PASS="Hblu&Bqual247"
DB_NAME="stachblx_manylla_sync_qual"

echo "📡 Connecting to server..."

# Check if schema.sql exists on remote
echo "Checking for schema.sql on remote server..."
ssh ${SSH_USER}@${SSH_HOST} "test -f ${REMOTE_PATH}/schema.sql && echo 'Schema file found' || echo 'Schema file not found'"

if [ $? -ne 0 ]; then
    echo "❌ Failed to connect to server"
    echo
    echo "Alternative: Manual SSH Method"
    echo "=============================="
    echo "1. SSH into the server manually:"
    echo "   ssh ${SSH_USER}@${SSH_HOST}"
    echo
    echo "2. Navigate to qual API sync directory:"
    echo "   cd ${REMOTE_PATH}"
    echo
    echo "3. Apply the schema:"
    echo "   mysql -u ${DB_USER} -p'${DB_PASS}' ${DB_NAME} < schema.sql"
    echo
    echo "4. Verify tables:"
    echo "   mysql -u ${DB_USER} -p'${DB_PASS}' ${DB_NAME} -e 'SHOW TABLES;'"
    echo
    exit 1
fi

echo "📋 Applying Phase 3 schema to qual database..."

# Apply schema
ssh ${SSH_USER}@${SSH_HOST} "cd ${REMOTE_PATH} && mysql -u ${DB_USER} -p'${DB_PASS}' ${DB_NAME} < schema.sql"

if [ $? -eq 0 ]; then
    echo "✅ Schema applied successfully!"
    
    # Verify tables
    echo
    echo "🔍 Verifying tables..."
    ssh ${SSH_USER}@${SSH_HOST} "mysql -u ${DB_USER} -p'${DB_PASS}' ${DB_NAME} -e 'SHOW TABLES;'"
    
    echo
    echo "📊 Checking sync_data table structure..."
    ssh ${SSH_USER}@${SSH_HOST} "mysql -u ${DB_USER} -p'${DB_PASS}' ${DB_NAME} -e 'DESCRIBE sync_data;'"
    
    echo
    echo "📊 Checking sync_backups table structure..."
    ssh ${SSH_USER}@${SSH_HOST} "mysql -u ${DB_USER} -p'${DB_PASS}' ${DB_NAME} -e 'DESCRIBE sync_backups;'"
    
    echo
    echo "✅ Phase 3 database schema has been applied successfully!"
    echo "🌐 You can now test the application at: https://manylla.com/qual"
else
    echo "❌ Failed to apply schema"
    echo
    echo "Please try the manual method above or check server logs."
    exit 1
fi