# 🚀 AuditSoft Deployment Guide for Plesk (Without SSH)

## Overview

This guide covers deploying AuditSoft to Plesk when SSH/Terminal access is not available. We'll use:
- ✅ Plesk File Manager (web interface)
- ✅ FTP/SFTP upload
- ✅ Pre-built files deployment
- ✅ Git integration (if available)
- ✅ Plesk Extensions

---

## ⚠️ Prerequisites

Before starting, verify you have:
- [ ] Plesk account access (email + password)
- [ ] Two subdomains created:
  - `app.mw265.com` (Frontend)
  - `api.mw265.com` (Backend)
- [ ] MySQL database created in Plesk
- [ ] FTP/SFTP access (or check if available)
- [ ] Node.js enabled in Plesk (check Extensions)
- [ ] ~500MB disk space available

---

## Step 1: Check Plesk Capabilities

### 1.1 Log Into Plesk Console
```
Go to: https://your-plesk-domain.com:8443 (typical Plesk port)
Username: Your Plesk email
Password: Your Plesk password
```

### 1.2 Check Available Tools
In Plesk console, look for:
- **File Manager** ✓ (Available in all plans)
- **FTP/SFTP accounts** (Check in Subscriptions > Credentials)
- **Extensions** (Check if Node.js available)
- **Git** (Check if Git integration available)
- **Terminal** (Check Settings > Advanced)

### 1.3 Check Node.js Installation
```
Plesk → Extensions → Node.js
If not installed: Click "Install" (if available in your plan)
```

---

## Phase 1: Prepare Your Local Environment

### 1.1 Build Frontend for Production

On your local machine, build the React app:

```bash
cd auditsoft-frontend
npm install
npm run build
```

Result: `build/` folder with all optimized frontend files.

### 1.2 Build Backend for Production

```bash
cd ../backend
npm install
npm run build
```

Result: `dist/` folder with compiled backend code.

### 1.3 Create Deployment Packages

Create these two packages locally:

#### Package 1: Frontend
```
frontend-dist.zip
├── build/ (from npm run build)
├── package.json
└── package-lock.json
```

#### Package 2: Backend
```
backend-dist.zip
├── dist/ (from npm run build)
├── prisma/
├── package.json
├── package-lock.json
├── .env (with your config)
└── prisma.config.ts
```

---

## Phase 2: Backend Deployment (api.mw265.com)

### 2.1 Create MySQL Database in Plesk

1. **Go to**: Plesk Dashboard → Subscriptions → Your Domain
2. **Click**: Databases
3. **Click**: "Add Database"
4. **Enter**:
   - Name: `auditsoft_db`
   - Description: AuditSoft Backend Database

5. **Click**: "Add"

### 2.2 Create Database User

1. **Back in Databases section**
2. **Click**: "Add User"
3. **Enter**:
   - Name: `auditsoft_user`
   - Password: (Create a strong password and save it!)
   - Database: Select `auditsoft_db`

4. **Permissions**: Grant all privileges
5. **Click**: "Add"

### 2.3 Get Database Connection Details

In your Plesk database info, note:
- **Database**: `auditsoft_db`
- **User**: `auditsoft_user`
- **Password**: (what you set)
- **Host**: Usually `localhost` or `127.0.0.1`

### 2.4 Upload Backend Files

#### Option A: Using Plesk File Manager (Easiest)

1. **Go to**: Plesk → File Manager
2. **Navigate to**: `httpdocs/api` (create `api` folder if needed)
3. **Right-click** → "Upload Files"
4. **Select**: `backend-dist.zip`
5. **Wait** for upload
6. **Right-click** → "Extract" on the ZIP file
7. **Move files** from extracted folder to parent directory

#### Option B: Using FTP/SFTP

1. **Get FTP credentials**:
   - Plesk → Subscriptions → Your Domain → FTP Access
   - Copy: Host, Username, Password

2. **Use FTP client** (e.g., FileZilla):
   - Host: `ftp.mw265.com` or IP from Plesk
   - Username: FTP username from Plesk
   - Password: FTP password
   - Port: 21 (FTP) or 22 (SFTP)

3. **Upload to**: `/httpdocs/api/` folder
4. **Extract** ZIP file on server

### 2.5 Create Environment File

#### Using Plesk File Manager:

1. **Navigate to**: `httpdocs/api/`
2. **Right-click** → "Create File"
3. **Name**: `.env`
4. **Right-click** → "Edit"
5. **Paste**:

```env
DATABASE_URL="mysql://auditsoft_user:YOUR_PASSWORD@localhost:3306/auditsoft_db"
NODE_ENV=production
PORT=3000
API_URL=https://api.mw265.com
FRONTEND_URL=https://app.mw265.com
JWT_SECRET=your-secret-key-here-change-this
```

**Replace**:
- `YOUR_PASSWORD` with the database password you created
- `your-secret-key-here-change-this` with a strong random string

6. **Save**

### 2.6 Run Database Migrations

⚠️ **Note**: This requires terminal/SSH. If you don't have SSH:

#### Alternative 1: Manual SQL Import

1. **Go to**: Plesk → Databases → `auditsoft_db`
2. **Click**: "phpMyAdmin" (if available)
3. **In phpMyAdmin**:
   - Go to "SQL" tab
   - Copy the SQL from: `backend/prisma/migrations/20260119224841_init/migration.sql`
   - Paste and Execute
   - Repeat for: `backend/prisma/migrations/20260119234452_add/migration.sql`

#### Alternative 2: Use Prisma Web UI

If Node.js is installed in Plesk:
1. Run: `npx prisma migrate deploy` (needs terminal)
2. Or use: `npx prisma studio` for database GUI

### 2.7 Install Node Modules

In Plesk File Manager (in `httpdocs/api/`):

1. Create file: `.npmrc` (if Node.js available in Plesk)
2. Run npm install via Plesk if possible

**Note**: If Plesk doesn't support npm, you'll need to:
- Run `npm install` locally
- Upload `node_modules/` folder via FTP (very large!)

---

## Phase 3: Frontend Deployment (app.mw265.com)

### 3.1 Upload Frontend Files

#### Using Plesk File Manager:

1. **Go to**: Plesk → File Manager
2. **Navigate to**: `httpdocs/` (for app.mw265.com)
3. **Upload**: `frontend-dist.zip`
4. **Extract** and move `build/` contents to `httpdocs/`

#### Using FTP:

1. Use FTP client to upload to `httpdocs/` folder
2. The `build/` folder contents should be in root of `httpdocs/`

### 3.2 Create .htaccess for React Router

1. **In Plesk File Manager** → `httpdocs/`
2. **Create file**: `.htaccess`
3. **Paste**:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

4. **Save**

This ensures React Router works correctly for page refreshes.

### 3.3 Create .env.production

1. **In Plesk File Manager** → `httpdocs/`
2. **Create file**: `.env.production`
3. **Paste**:

```
REACT_APP_API_URL=https://api.mw265.com
REACT_APP_ENV=production
```

4. **Save**

---

## Phase 4: Web Server Configuration

### 4.1 Configure api.mw265.com (Backend)

#### If Using Apache:

1. **Plesk** → Subscriptions → `api.mw265.com`
2. **Go to**: Apache & Nginx Settings
3. **Additional Apache Directives**:

```apache
# Redirect HTTP to HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Proxy to Node.js
ProxyPreserveHost On
ProxyPass / http://127.0.0.1:3000/
ProxyPassReverse / http://127.0.0.1:3000/
```

4. **Save**

#### If Using Nginx:

Contact Plesk support or check Plesk documentation for Nginx configuration.

### 4.2 Configure app.mw265.com (Frontend)

Plesk typically handles this automatically for static sites.

---

## Phase 5: SSL/HTTPS Setup

### 5.1 Install Free Let's Encrypt Certificate

1. **Go to**: Plesk Dashboard
2. **Select domain**: `api.mw265.com`
3. **Go to**: SSL/TLS Certificates
4. **Click**: "Install a free Let's Encrypt certificate"
5. **Configure** for your domain
6. **Install**

Repeat for: `app.mw265.com`

### 5.2 Auto-Renewal

Let's Encrypt certificates auto-renew in Plesk. Verify in:
- Plesk → SSL/TLS Certificates → Check renewal settings

---

## Phase 6: Start Backend Service

### Option 1: Using Plesk Node.js Extension (Easiest)

1. **Plesk** → Extensions → Node.js
2. If available, Node.js applications can be deployed via UI
3. **Create Node.js application**:
   - Domain: `api.mw265.com`
   - Path: `/httpdocs/api/`
   - Start File: `dist/main.js`
   - Node.js Version: 18+ (select latest)

### Option 2: Using PM2 (If SSH Available Later)

```bash
cd /var/www/vhosts/api.mw265.com/httpdocs/api
npm install pm2 -g
pm2 start dist/main.js --name "auditsoft-backend"
pm2 startup
pm2 save
```

### Option 3: Using Forever Service

If PM2 not available, use Forever or similar Node.js manager.

---

## Phase 7: Verify Deployment

### 7.1 Test Frontend

Visit: **https://app.mw265.com**

You should see:
- ✅ AuditSoft login page
- ✅ No console errors (F12 → Console)
- ✅ No CORS errors

### 7.2 Test Backend

Visit: **https://api.mw265.com/audits**

You should see:
- ✅ JSON response or error (not 404)
- ✅ If error, check `console.error` logs

### 7.3 Test API Connection

Login on **https://app.mw265.com**:
- Email: `admin@auditsoft.com`
- Password: `password123`

Should be able to:
- ✅ See dashboard
- ✅ Create audit
- ✅ View findings

---

## Troubleshooting

### Problem: "Cannot connect to api.mw265.com"

**Solutions**:
1. **Check backend is running**:
   - Plesk → Extensions → Check Node.js status
   - Verify process is running

2. **Check .env file**:
   - Verify DATABASE_URL is correct
   - Verify API_URL matches your domain

3. **Check database connection**:
   - Verify username/password correct
   - Verify database created in Plesk
   - Test in phpMyAdmin

4. **Check CORS**:
   - Open F12 → Console
   - Check for CORS errors
   - Verify `FRONTEND_URL` in backend .env

### Problem: "Cannot see frontend page"

**Solutions**:
1. **Check .htaccess exists** in frontend `httpdocs/`
2. **Clear browser cache**: Ctrl+Shift+Delete
3. **Check for 404 errors**: F12 → Network tab
4. **Verify build files uploaded**: Check `httpdocs/` has `index.html`

### Problem: "Database connection error"

**Solutions**:
1. **Verify credentials in .env**:
   ```env
   DATABASE_URL="mysql://user:pass@localhost:3306/db"
   ```

2. **Test in phpMyAdmin**:
   - Plesk → Databases → phpMyAdmin
   - Can you connect?

3. **Run migrations**:
   - Via phpMyAdmin import SQL files
   - Or use: `npx prisma migrate deploy`

### Problem: "CORS error in console"

**Solutions**:
1. **Check API_URL in .env matches domain**:
   ```env
   API_URL=https://api.mw265.com
   FRONTEND_URL=https://app.mw265.com
   ```

2. **Check backend CORS config**:
   - Look for `cors()` in `src/main.ts`
   - Verify it allows frontend domain

---

## Important Notes

### ⚠️ Node.js Availability

Not all Plesk plans include Node.js. Check:
1. Plesk → Extensions → Look for Node.js
2. If not available, contact hosting provider
3. Some hosts require separate VPS for Node.js apps

### ⚠️ Database Migrations

Without SSH, manual SQL import is needed:
1. Use phpMyAdmin in Plesk
2. Import SQL files from `prisma/migrations/`
3. Or contact your host to run migrations

### ⚠️ Environment Variables

If Plesk doesn't support `.env` files:
1. Modify `dist/main.js` to use hardcoded values (not recommended)
2. Or ask host to add environment variable support
3. Or use Plesk settings panel if available

### ✅ Default Login (Change Immediately!)

```
Email: admin@auditsoft.com
Password: password123
```

**Change this immediately after first login!**

---

## Deployment Checklist

### Backend (api.mw265.com)
- [ ] MySQL database created (`auditsoft_db`)
- [ ] Database user created (`auditsoft_user`)
- [ ] Backend files uploaded to `httpdocs/api/`
- [ ] `.env` file created with correct database URL
- [ ] Database migrations run (via phpMyAdmin)
- [ ] `node_modules` installed or uploaded
- [ ] Backend service started (Node.js extension)
- [ ] API accessible at `https://api.mw265.com`
- [ ] SSL certificate installed
- [ ] CORS configured

### Frontend (app.mw265.com)
- [ ] Frontend build files uploaded to `httpdocs/`
- [ ] `.htaccess` file created for React Router
- [ ] `.env.production` created with API URL
- [ ] Frontend accessible at `https://app.mw265.com`
- [ ] SSL certificate installed
- [ ] Login works with admin credentials
- [ ] Can create audit and view findings
- [ ] No console errors in F12

### Post-Deployment
- [ ] Change default admin password
- [ ] Configure any firewall rules needed
- [ ] Set up monitoring/logging
- [ ] Test all major features
- [ ] Document any special configurations

---

## Quick Reference: File Locations

```
Plesk File Manager Navigation:

Root: /
├── httpdocs/
│   ├── app.mw265.com/
│   │   ├── index.html (frontend build)
│   │   ├── .htaccess
│   │   └── ... (other build files)
│   └── api.mw265.com/
│       ├── dist/ (backend build)
│       ├── prisma/
│       ├── node_modules/
│       ├── .env
│       └── package.json
```

---

## Support Resources

If you get stuck:

1. **Check Plesk Documentation**:
   - https://docs.plesk.com/

2. **Contact Your Hosting Provider**:
   - Ask about Node.js support
   - Ask about SSH access (may be available)
   - Ask about git integration

3. **Check Database**:
   - Plesk → Databases → phpMyAdmin
   - Test SQL queries

4. **Monitor Logs**:
   - Plesk → Logs
   - Check error logs for clues

---

## Next Steps

After deployment:

1. **Test thoroughly**:
   - Test all user roles
   - Test audit creation
   - Test finding workflow

2. **Change default password**:
   - Change admin@auditsoft.com password
   - Create actual user accounts

3. **Configure backups**:
   - Set up database backups
   - Set up file backups in Plesk

4. **Monitor performance**:
   - Check Plesk resource usage
   - Monitor database size
   - Monitor API response times

---

## Security Reminders

⚠️ **Critical**:
- [ ] Change default admin password immediately
- [ ] Set strong database password
- [ ] Don't commit .env to git
- [ ] Keep Node.js updated
- [ ] Keep MySQL updated
- [ ] Enable HTTPS (Let's Encrypt)
- [ ] Configure firewall rules

---

*Guide for Plesk Without SSH*  
*Version: 1.0*  
*Last Updated: January 2026*
