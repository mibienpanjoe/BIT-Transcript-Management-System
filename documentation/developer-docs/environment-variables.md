# Environment Variables Documentation

Complete guide to all environment variables used in BIT TMS.

## Backend Environment Variables

Create a `.env` file in the `backend/` directory:

### Required Variables

```env
# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bit-tms?retryWrites=true&w=majority
# MongoDB connection string
# Development: Use local MongoDB or Atlas free tier
# Production: Use Atlas dedicated cluster

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
# Secret key for signing JWT tokens
# IMPORTANT: Use a strong, random string in production
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

JWT_EXPIRE=24h
# JWT token expiration time
# Format: 24h, 7d, 30d
# Recommended: 24h for production

# Server Configuration
PORT=5000
# Port for backend server
# Default: 5000
# Production: Usually set by hosting provider

NODE_ENV=development
# Environment mode
# Values: development, production, test
# Affects logging, error messages, CORS

# CORS Configuration
FRONTEND_URL=http://localhost:5173
# Frontend URL for CORS
# Development: http://localhost:5173
# Production: https://your-frontend-domain.com
# Multiple URLs: Separate with commas

# File Upload Configuration
MAX_FILE_SIZE=10485760
# Maximum file upload size in bytes
# Default: 10MB (10485760 bytes)
# Adjust based on your needs

UPLOAD_DIR=./uploads
# Directory for file uploads
# Default: ./uploads
# Ensure directory exists and has write permissions
```

### Optional Variables

```env
# Logging Configuration
LOG_LEVEL=info
# Logging level
# Values: error, warn, info, debug
# Default: info

LOG_FILE=logs/app.log
# Log file path
# Default: logs/app.log

# Email Configuration (Future feature)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@bit.edu.bf

# Rate Limiting
RATE_LIMIT_WINDOW=15
# Time window in minutes
# Default: 15 minutes

RATE_LIMIT_MAX=100
# Maximum requests per window
# Default: 100 requests

# Session Configuration
SESSION_SECRET=another-secret-key-for-sessions
# Secret for session encryption

# PDF Generation
PDF_LOGO_PATH=./assets/bit-logo.png
# Path to BIT logo for PDFs

# Monitoring (Production)
SENTRY_DSN=https://your-sentry-dsn
# Sentry error tracking DSN
```

---

## Frontend Environment Variables

Create a `.env` file in the `frontend/` directory:

### Development (.env.development)

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api
# Backend API base URL
# Must match backend server URL

# Application Configuration
VITE_APP_NAME=BIT TMS
# Application name displayed in UI

VITE_APP_VERSION=1.0.0
# Application version

# Feature Flags
VITE_ENABLE_DEBUG=true
# Enable debug mode
# Shows additional logging in console
```

### Production (.env.production)

```env
# API Configuration
VITE_API_URL=https://your-backend-domain.com/api
# Production backend URL
# IMPORTANT: Use HTTPS in production

# Application Configuration
VITE_APP_NAME=BIT TMS
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_DEBUG=false
# Disable debug mode in production

# Analytics (Optional)
VITE_GA_TRACKING_ID=UA-XXXXXXXXX-X
# Google Analytics tracking ID

# Error Tracking (Optional)
VITE_SENTRY_DSN=https://your-sentry-dsn
# Sentry error tracking for frontend
```

---

## Environment-Specific Configuration

### Development

```env
# Backend
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/bit-tms-dev
JWT_SECRET=dev-secret-key-change-in-production
FRONTEND_URL=http://localhost:5173
PORT=5000

# Frontend
VITE_API_URL=http://localhost:5000/api
VITE_ENABLE_DEBUG=true
```

### Production

```env
# Backend
NODE_ENV=production
MONGODB_URI=mongodb+srv://prod-user:strong-password@cluster.mongodb.net/bit-tms-prod
JWT_SECRET=production-secret-key-very-long-and-random
FRONTEND_URL=https://tms.bit.edu.bf
PORT=5000

# Frontend
VITE_API_URL=https://api-tms.bit.edu.bf/api
VITE_ENABLE_DEBUG=false
```

### Testing

```env
# Backend
NODE_ENV=test
MONGODB_URI=mongodb://localhost:27017/bit-tms-test
JWT_SECRET=test-secret-key
FRONTEND_URL=http://localhost:5173
PORT=5001

# Frontend
VITE_API_URL=http://localhost:5001/api
VITE_ENABLE_DEBUG=true
```

---

## Security Best Practices

### DO ✅

1. **Use strong secrets**
   ```bash
   # Generate strong JWT secret
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **Never commit .env files**
   ```gitignore
   # .gitignore
   .env
   .env.local
   .env.production
   .env.development
   ```

3. **Use different secrets per environment**
   - Development: Can be simple
   - Production: Must be strong and unique

4. **Rotate secrets regularly**
   - Change JWT secrets every 3-6 months
   - Update all active sessions

5. **Use environment-specific databases**
   - Never use production DB in development
   - Use separate test database

### DON'T ❌

1. **Don't hardcode secrets in code**
   ```javascript
   // ❌ Bad
   const secret = 'my-secret-key';
   
   // ✅ Good
   const secret = process.env.JWT_SECRET;
   ```

2. **Don't share .env files**
   - Use secure methods to share secrets
   - Use secret management tools (e.g., AWS Secrets Manager)

3. **Don't use weak secrets**
   - ❌ "password123"
   - ❌ "secret"
   - ✅ "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6..."

4. **Don't expose secrets in logs**
   ```javascript
   // ❌ Bad
   console.log('JWT Secret:', process.env.JWT_SECRET);
   
   // ✅ Good
   console.log('JWT Secret: [REDACTED]');
   ```

---

## Loading Environment Variables

### Backend (Node.js)

```javascript
// Load at application start
require('dotenv').config();

// Access variables
const mongoUri = process.env.MONGODB_URI;
const jwtSecret = process.env.JWT_SECRET;
const port = process.env.PORT || 5000;

// Validate required variables
if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is required');
  process.exit(1);
}
```

### Frontend (Vite)

```javascript
// Access variables (automatically loaded by Vite)
const apiUrl = import.meta.env.VITE_API_URL;
const appName = import.meta.env.VITE_APP_NAME;

// Note: Only variables prefixed with VITE_ are exposed to frontend
```

---

## Deployment Checklist

### Before Deployment

- [ ] All required variables are set
- [ ] Secrets are strong and unique
- [ ] Production URLs are correct
- [ ] Database connection string is valid
- [ ] CORS is configured correctly
- [ ] .env files are in .gitignore

### After Deployment

- [ ] Verify environment variables are loaded
- [ ] Test database connection
- [ ] Test API endpoints
- [ ] Test frontend-backend communication
- [ ] Monitor for errors

---

## Troubleshooting

### "MONGODB_URI is not defined"
- Ensure .env file exists
- Check file is in correct directory
- Verify dotenv is loaded: `require('dotenv').config()`

### "Cannot connect to database"
- Verify MONGODB_URI is correct
- Check network access (MongoDB Atlas whitelist)
- Verify database user credentials

### "CORS error"
- Check FRONTEND_URL matches actual frontend URL
- Ensure CORS middleware is configured
- Verify protocol (http vs https)

### "JWT token invalid"
- Ensure JWT_SECRET is the same across all instances
- Check token hasn't expired
- Verify JWT_EXPIRE format is correct

---

**Document Version**: 1.0  
**Last Updated**: November 22, 2025  
**For**: BIT TMS Developers
