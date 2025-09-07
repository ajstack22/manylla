#!/bin/bash

# Script to apply Phase 3 database schema to qual environment
# Run this after SSHing into the server

echo "Phase 3 Database Schema Application"
echo "===================================="
echo

# Navigate to the qual API sync directory
cd /home/stachblx/public_html/qual/api/sync

# Check if schema.sql exists
if [ ! -f schema.sql ]; then
    echo "Error: schema.sql not found in current directory"
    exit 1
fi

echo "Applying schema to qual database..."
echo "Database: stachblx_manylla_sync_qual"
echo

# Apply the schema
mysql -u stachblx_manyqual -p'Hblu&Bqual247' stachblx_manylla_sync_qual < schema.sql

if [ $? -eq 0 ]; then
    echo "✅ Schema applied successfully!"
    
    # Show the tables to verify
    echo
    echo "Verifying tables:"
    mysql -u stachblx_manyqual -p'Hblu&Bqual247' stachblx_manylla_sync_qual -e "SHOW TABLES;"
    
    echo
    echo "Checking sync_data table structure:"
    mysql -u stachblx_manyqual -p'Hblu&Bqual247' stachblx_manylla_sync_qual -e "DESCRIBE sync_data;"
    
    echo
    echo "Checking sync_backups table structure:"
    mysql -u stachblx_manyqual -p'Hblu&Bqual247' stachblx_manylla_sync_qual -e "DESCRIBE sync_backups;"
else
    echo "❌ Error applying schema"
    exit 1
fi

echo
echo "Phase 3 database schema has been applied successfully!"
echo "You can now test the application at: https://manylla.com/qual"