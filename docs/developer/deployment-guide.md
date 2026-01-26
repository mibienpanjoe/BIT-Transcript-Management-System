# BIT TMS Deployment Guide

Complete guide for deploying the BIT Transcript Management System to production.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Backend Deployment](#backend-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [Post-Deployment](#post-deployment)
7. [Monitoring](#monitoring)

---

## Prerequisites

### Required Accounts
- [ ] MongoDB Atlas account
- [ ] Hosting service account (Render, Heroku, or DigitalOcean for backend)
- [ ] Frontend hosting account (Vercel or Netlify)
- [ ] Domain name (optional)

### Required Tools
- Node.js 18+ and npm
- Git
- MongoDB Compass (for database management)

---

## Environment Setup

### Backend Environment Variables

Create `.env` file in backend directory:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bit-tms?retryWrites=true&w=majority

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=24h

# Server
PORT=5000
NODE_ENV=production

# CORS
FRONTEND_URL=https://your-frontend-domain.com

# File Upload (if using cloud storage)
MAX_FILE_SIZE=10485760
```

### Frontend Environment Variables

Create `.env.production` file in frontend directory:

```env
VITE_API_URL=https://your-backend-domain.com/api
VITE_APP_NAME=BIT TMS
```

---

## Database Setup

### MongoDB Atlas Setup

1. **Create Cluster**
   - Log in to MongoDB Atlas
   - Click "Build a Database"
   - Choose "Shared" (free tier) or "Dedicated"
   - Select region closest to your users
   - Create cluster

2. **Configure Network Access**
   - Navigate to "Network Access"
   - Click "Add IP Address"
   - Select "Allow Access from Anywhere" (0.0.0.0/0)
   - Or add specific IP addresses for security

3. **Create Database User**
   - Navigate to "Database Access"
   - Click "Add New Database User"
   - Choose authentication method: Password
   - Create username and strong password
   - Grant "Read and write to any database" role

4. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `bit-tms`

5. **Create Indexes**
   - Connect using MongoDB Compass or mongosh
   - Run index creation script (see [Database Schema](./database-schema.md#indexes))

---

## Backend Deployment

### Option 1: Deploy to Render

1. **Prepare Repository**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Create Web Service on Render**
   - Log in to Render
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: bit-tms-backend
     - **Environment**: Node
     - **Build Command**: `cd backend && npm install`
     - **Start Command**: `cd backend && npm start`
     - **Instance Type**: Free or Starter

3. **Add Environment Variables**
   - In Render dashboard, go to "Environment"
   - Add all variables from `.env` file
   - Click "Save Changes"

4. **Deploy**
   - Click "Manual Deploy" → "Deploy latest commit"
   - Wait for deployment to complete
   - Note the deployment URL (e.g., `https://bit-tms-backend.onrender.com`)

### Option 2: Deploy to Heroku

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Login and Create App**
   ```bash
   heroku login
   heroku create bit-tms-backend
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set MONGODB_URI="your-connection-string"
   heroku config:set JWT_SECRET="your-secret"
   heroku config:set NODE_ENV=production
   ```

4. **Deploy**
   ```bash
   git subtree push --prefix backend heroku main
   ```

### Verify Backend Deployment

Test the API:
```bash
curl https://your-backend-url.com/api/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "BIT TMS API is running"
}
```

---

## Frontend Deployment

### Option 1: Deploy to Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

4. **Configure Environment Variables**
   - In Vercel dashboard, go to project settings
   - Navigate to "Environment Variables"
   - Add `VITE_API_URL` with your backend URL
   - Redeploy

### Option 2: Deploy to Netlify

1. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy via Netlify CLI**
   ```bash
   npm install -g netlify-cli
   netlify login
   netlify deploy --prod --dir=dist
   ```

3. **Configure Environment Variables**
   - In Netlify dashboard, go to "Site settings"
   - Navigate to "Build & deploy" → "Environment"
   - Add `VITE_API_URL`
   - Trigger redeploy

### Verify Frontend Deployment

1. Visit your frontend URL
2. Try logging in with test credentials
3. Verify API calls are working

---

## Post-Deployment

### 1. Create Initial Admin User

Connect to your production database and create the first admin user:

```javascript
// Using MongoDB Compass or mongosh
use bit-tms;

db.users.insertOne({
  email: "admin@bit.edu.bf",
  password: "$2b$10$hashedPasswordHere", // Use bcrypt to hash
  role: "admin",
  firstName: "System",
  lastName: "Administrator",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});
```

Or use the backend API:
```bash
curl -X POST https://your-backend-url.com/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@bit.edu.bf",
    "password": "ChangeThisPassword123!",
    "role": "admin",
    "firstName": "System",
    "lastName": "Administrator"
  }'
```

### 2. Configure CORS

Ensure backend allows requests from frontend domain:

```javascript
// backend/server.js
const cors = require('cors');

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

### 3. Set Up HTTPS

- Vercel and Netlify provide automatic HTTPS
- For custom domains, configure SSL certificates
- Ensure all API calls use HTTPS

### 4. Database Backup

Set up automated backups:
- MongoDB Atlas: Enable "Continuous Backup" in cluster settings
- Schedule: Daily backups recommended
- Retention: Keep at least 7 days

---

## Monitoring

### 1. Application Monitoring

**Recommended Tools:**
- **Sentry**: Error tracking
- **LogRocket**: Session replay
- **New Relic**: Performance monitoring

**Setup Sentry (Example):**
```bash
npm install @sentry/node @sentry/react
```

```javascript
// backend/server.js
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});
```

### 2. Uptime Monitoring

**Recommended Tools:**
- UptimeRobot (free)
- Pingdom
- StatusCake

**Setup:**
1. Create account
2. Add monitor for backend URL
3. Add monitor for frontend URL
4. Configure alerts (email/SMS)

### 3. Database Monitoring

- Monitor in MongoDB Atlas dashboard
- Set up alerts for:
  - High CPU usage
  - High memory usage
  - Slow queries
  - Connection limits

### 4. Logs

**Backend Logs:**
- Use Winston for structured logging
- Store logs in files or cloud service (e.g., Papertrail)

**Frontend Logs:**
- Use console.error for errors
- Send critical errors to Sentry

---

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database indexes created
- [ ] CORS configured correctly
- [ ] Security headers added (Helmet.js)
- [ ] Rate limiting configured
- [ ] File upload limits set

### Deployment
- [ ] Backend deployed successfully
- [ ] Frontend deployed successfully
- [ ] Database connected
- [ ] Initial admin user created
- [ ] HTTPS enabled

### Post-Deployment
- [ ] Test login functionality
- [ ] Test user creation
- [ ] Test student import
- [ ] Test grade entry
- [ ] Test transcript generation
- [ ] Verify PDF downloads
- [ ] Check error logging
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Document deployment URLs

---

## Rollback Procedure

If deployment fails:

1. **Revert Backend**
   ```bash
   # Render: Redeploy previous commit
   # Heroku:
   heroku rollback
   ```

2. **Revert Frontend**
   ```bash
   # Vercel:
   vercel rollback
   # Netlify: Use dashboard to rollback
   ```

3. **Database Restore**
   - Use MongoDB Atlas backup
   - Restore to specific point in time

---

## Troubleshooting

### Backend Won't Start
- Check environment variables
- Verify MongoDB connection string
- Check logs for errors
- Ensure PORT is not in use

### Frontend Can't Connect to Backend
- Verify VITE_API_URL is correct
- Check CORS configuration
- Ensure backend is running
- Check network tab in browser DevTools

### Database Connection Fails
- Verify connection string
- Check network access whitelist
- Verify database user credentials
- Check if cluster is running

### PDF Generation Fails
- Check server memory limits
- Verify PDFKit is installed
- Check file system permissions
- Review error logs

---

## Maintenance

### Regular Tasks
- **Daily**: Monitor error logs
- **Weekly**: Review performance metrics
- **Monthly**: Update dependencies
- **Quarterly**: Security audit

### Updates
```bash
# Update dependencies
npm update

# Check for security vulnerabilities
npm audit
npm audit fix
```

---

**Document Version**: 1.0  
**Last Updated**: November 22, 2025  
**For**: BIT TMS Developers
