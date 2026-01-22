# 🚀 Quick Deployment Reference - mw265.com

## Your Subdomains
| Purpose | URL | Service |
|---------|-----|---------|
| Frontend | https://app.mw265.com | React App |
| API/Backend | https://api.mw265.com | NestJS API |

---

## One-Line Deployment Commands

### Backend Setup (SSH as root or with sudo)
```bash
cd /var/www/vhosts/mw265.com/api.mw265.com && \
git clone https://github.com/felixkumafutsa/auditsoft-backend.git . && \
npm install && \
# Create .env file with DATABASE_URL and other config
npm run build && \
npm install -g pm2 && \
pm2 start ecosystem.config.js && \
pm2 save
```

### Frontend Setup (SSH as root or with sudo)
```bash
cd /var/www/vhosts/mw265.com/app.mw265.com/httpdocs && \
git clone https://github.com/felixkumafutsa/auditsoft-frontend.git . && \
npm install && \
# Create .env.production with REACT_APP_API_URL
npm run build && \
cp -r build/* .
```

---

## Critical Environment Variables

### Backend .env
```
DATABASE_URL=mysql://auditsoft_user:password@localhost:3306/auditsoft_db
NODE_ENV=production
PORT=3000
API_URL=https://api.mw265.com
FRONTEND_URL=https://app.mw265.com
JWT_SECRET=your_secure_key_here
```

### Frontend .env.production
```
REACT_APP_API_URL=https://api.mw265.com
REACT_APP_ENV=production
```

---

## Database Setup Commands
```bash
mysql -u root -p

CREATE DATABASE auditsoft_db;
CREATE USER 'auditsoft_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON auditsoft_db.* TO 'auditsoft_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Then run migrations
cd /var/www/vhosts/mw265.com/api.mw265.com
npx prisma migrate deploy
```

---

## Post-Deployment Checklist

- [ ] **SSH Access**: Can connect to server
- [ ] **Clone Repos**: Both frontend and backend cloned
- [ ] **Dependencies**: `npm install` completed
- [ ] **Database**: Created with correct user/password
- [ ] **Migrations**: `npx prisma migrate deploy` successful
- [ ] **Build**: Both apps built successfully
- [ ] **PM2**: Backend running with `pm2 list`
- [ ] **SSL**: HTTPS working for both subdomains
- [ ] **Login**: Can access https://app.mw265.com and login
- [ ] **API**: https://api.mw265.com responds to requests

---

## Testing URLs

1. **Frontend**: https://app.mw265.com
2. **API Health**: https://api.mw265.com/audits
3. **Login**: admin@auditsoft.com / password123

---

## Essential Commands

### Backend
```bash
# View logs
pm2 logs auditsoft-backend

# Restart
pm2 restart auditsoft-backend

# View running apps
pm2 list

# Stop
pm2 stop auditsoft-backend
```

### Database
```bash
# Backup
mysqldump -u auditsoft_user -p auditsoft_db > backup.sql

# Restore
mysql -u auditsoft_user -p auditsoft_db < backup.sql

# Check tables
mysql -u auditsoft_user -p -e "USE auditsoft_db; SHOW TABLES;"
```

### Updates
```bash
# Pull latest code
cd /var/www/vhosts/mw265.com/api.mw265.com
git pull origin main
npm install
npm run build
pm2 restart auditsoft-backend

# Frontend
cd /var/www/vhosts/mw265.com/app.mw265.com/httpdocs
git pull origin main
npm install
npm run build
cp -r build/* .
```

---

## 🆘 Emergency Fixes

### Backend won't start
```bash
lsof -i :3000  # Check port
pm2 logs auditsoft-backend  # Check logs
pm2 restart auditsoft-backend  # Restart
```

### Database connection error
```bash
mysql -u auditsoft_user -p -h localhost auditsoft_db  # Test connection
# Check .env DATABASE_URL is correct
```

### Frontend shows blank page
```bash
# Check browser console (F12)
# Verify REACT_APP_API_URL in .env.production
# Check build exists: ls httpdocs/index.html
```

### Port 3000 in use
```bash
lsof -i :3000
kill -9 <PID>
# or
pm2 restart auditsoft-backend
```

---

## Default Test Account

**Email**: admin@auditsoft.com  
**Password**: password123  

⚠️ **CHANGE THIS IMMEDIATELY IN PRODUCTION!**

---

## GitHub Repositories

- **Frontend**: https://github.com/felixkumafutsa/auditsoft-frontend
- **Backend**: https://github.com/felixkumafutsa/auditsoft-backend

Both have `PLESK-DEPLOYMENT.md` with full details.

---

## Support Documentation

In the repositories, see:
- `PLESK-DEPLOYMENT.md` - Full deployment guide
- `BOSS-REVIEW.md` - Project overview
- `QUICK-START.md` - Local development
- `ARCHITECTURE.md` - System design

---

**Ready to Deploy!** Follow the steps above and you'll have AuditSoft running on your Plesk hosting. 🎉
