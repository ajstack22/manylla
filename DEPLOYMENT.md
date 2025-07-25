# Manylla Deployment Guide

## Quick Deploy to stackmap.app/manylla

1. **Upload the build folder**
   - Connect to your hosting via FTP/cPanel
   - Navigate to the public_html folder
   - Create a `manylla` directory if it doesn't exist
   - Upload the entire contents of the `build` folder to `public_html/manylla/`

2. **File Structure**
   ```
   public_html/
   └── manylla/
       ├── index.html
       ├── manila.png
       ├── ellie.png
       ├── static/
       │   └── js/
       └── [other build files]
   ```

3. **Verify Deployment**
   - Visit https://stackmap.app/manylla
   - Check that the app loads correctly
   - Test the sync button in the header
   - Test creating and sharing entries

## Features Implemented

### Frontend (Complete)
- ✅ Profile management with Ellie's information
- ✅ Entry creation/editing for all categories
- ✅ Sharing with access codes and expiration
- ✅ Print/export functionality
- ✅ Light/dark theme toggle
- ✅ Zero-knowledge encryption
- ✅ Multi-device sync UI
- ✅ Recovery phrase generation

### Backend (Ready for Server Setup)
- 📁 PHP API endpoints created in `/api` folder
- 🔐 Encryption service adapted for web
- 🔄 Sync endpoints ready for deployment

## Next Steps

1. **Set up Database**
   - Use the SQL script in `/api/database/manylla_schema.sql
   - Update `/api/config/config.php` with database credentials

2. **Deploy API**
   - Upload the `/api` folder to your server
   - Ensure proper file permissions
   - Test CORS headers

3. **Update API URLs**
   - In production, update the API URLs in:
     - `/src/context/SyncContext.tsx` (lines 63, 103)
     - Any share-related components

## Current Status
The app is now ready for deployment with:
- Full UI functionality
- Client-side encryption working
- Sync dialog integrated
- Share features complete

The backend API endpoints are prepared but need server configuration to enable full sync functionality.