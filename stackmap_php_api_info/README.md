# StackMap Sync API - Complete Implementation Guide

This folder contains everything needed to recreate the StackMap sync API with its zero-knowledge architecture.

## Quick Start

1. **Database Setup**: Run `database/setup.sql` in your MySQL database
2. **Configuration**: Copy `api/config/config.example.php` to `api/config/config.php` and update credentials
3. **Upload Files**: Upload all files in `api/` to your web server's `/api/sync/` directory
4. **Test**: Use the test scripts in `tests/` to verify functionality

## Directory Structure

```
manyla/
├── README.md              # This file
├── database/             
│   └── setup.sql         # Complete database schema
├── api/                  
│   ├── config/          
│   │   ├── config.example.php  # Configuration template
│   │   └── database.php        # Database connection class
│   ├── utils/           
│   │   ├── validation.php      # Input validation
│   │   ├── rate-limiter.php   # Rate limiting
│   │   └── cors.php           # CORS headers
│   ├── create.php             # Create new sync group
│   ├── push.php               # Push encrypted data
│   ├── pull.php               # Pull latest data
│   ├── delete.php             # Delete sync data
│   ├── health.php             # Health check endpoint
│   └── cleanup.php            # Cleanup old data
├── docs/                
│   ├── API_REFERENCE.md       # Complete API documentation
│   ├── SECURITY.md            # Security implementation details
│   └── DEPLOYMENT.md          # Deployment instructions
└── tests/               
    ├── test-api.php           # PHP test script
    └── test-api.js            # JavaScript test script
```

## Key Features

- **Zero-Knowledge Architecture**: Server never sees unencrypted data
- **No User Accounts**: Authentication via recovery phrases only
- **End-to-End Encryption**: All data encrypted client-side
- **Automatic Cleanup**: 6-month data retention policy
- **Rate Limiting**: Prevents API abuse
- **CORS Support**: Works with web applications

## Security Notes

1. Always use HTTPS in production
2. Keep database credentials secure
3. Regularly run cleanup.php to remove old data
4. Monitor rate_limits table for abuse
5. Never log or store unencrypted data

## Testing

Run the test scripts to verify your implementation:

```bash
# PHP tests
php tests/test-api.php

# JavaScript tests (requires Node.js)
node tests/test-api.js
```

## Support

For questions or issues, refer to the documentation in the `docs/` folder.