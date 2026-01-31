# Deployment Guide

Complete guide for deploying the n8n Marketing Dashboard to production.

## Table of Contents

1. [Deployment Overview](#deployment-overview)
2. [Infrastructure Requirements](#infrastructure-requirements)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Backend Deployment](#backend-deployment)
6. [Frontend Deployment](#frontend-deployment)
7. [n8n Configuration](#n8n-configuration)
8. [Post-Deployment](#post-deployment)
9. [Monitoring and Maintenance](#monitoring-and-maintenance)
10. [Backup and Recovery](#backup-and-recovery)

---

## Deployment Overview

### Architecture

```
┌─────────────────────────────────────────┐
│         Users                          │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│      CDN / Load Balancer               │
│      (Cloudflare / AWS ALB)            │
└─────────────────────────────────────────┘
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
┌──────────────┐    ┌──────────────┐
│   Frontend   │    │   Backend    │
│   (Vercel)   │    │  (Railway)   │
│              │    │              │
│  React 19    │    │  Node.js     │
└──────────────┘    └──────────────┘
        │                   │
        └─────────┬─────────┘
                  ▼
        ┌──────────────────┐
        │   PostgreSQL     │
        │   (Supabase)     │
        └──────────────────┘
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
┌──────────────┐    ┌──────────────┐
│     n8n      │    │     Redis    │
│  (Self-host) │    │   (Optional) │
└──────────────┘    └──────────────┘
```

### Recommended Platforms

**Frontend:**
- Vercel (recommended)
- Netlify
- Cloudflare Pages

**Backend:**
- Railway (recommended)
- Render
- Fly.io
- AWS ECS

**Database:**
- Supabase (recommended)
- Railway PostgreSQL
- Render PostgreSQL
- AWS RDS

**n8n:**
- Self-hosted on VPS (DigitalOcean, AWS EC2)
- n8n Cloud

---

## Infrastructure Requirements

### Minimum Requirements

**Frontend:**
- CPU: Not applicable (serverless)
- Memory: Not applicable
- Build: 2-4 minutes
- CDN: Included

**Backend:**
- CPU: 1-2 cores
- Memory: 2-4 GB RAM
- Storage: 20 GB SSD
- Bandwidth: 1 TB/month

**Database:**
- CPU: 1-2 cores
- Memory: 2-4 GB RAM
- Storage: 50-100 GB SSD
- Connections: 50-100 concurrent

**n8n:**
- CPU: 2 cores
- Memory: 4 GB RAM
- Storage: 40 GB SSD

### Recommended Setup for Production

**Small Team (1-50 users):**
- Frontend: Vercel Hobby
- Backend: Railway Starter ($5/month)
- Database: Supabase Pro ($25/month)
- n8n: DigitalOcean Droplet ($24/month)

**Medium Team (50-200 users):**
- Frontend: Vercel Pro ($20/month)
- Backend: Railway Professional ($20/month)
- Database: Supabase Pro ($25/month)
- n8n: DigitalOcean Droplet ($48/month)

**Large Team (200+ users):**
- Frontend: Vercel Pro
- Backend: Railway Professional or AWS ECS
- Database: Supabase Pro or AWS RDS
- n8n: AWS EC2 or self-hosted cluster

---

## Environment Configuration

### Production Environment Variables

#### Backend Environment Variables

Create a `.env.production` file or configure in your hosting platform:

```bash
# ========== Database ==========
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"

# ========== JWT Authentication ==========
JWT_SECRET="your-production-jwt-secret-min-32-characters-long-and-secure"
JWT_ACCESS_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"

# ========== CORS ==========
CORS_ORIGIN="https://yourdomain.com,https://www.yourdomain.com"

# ========== Rate Limiting ==========
RATE_LIMIT_WINDOW_MS="60000"
RATE_LIMIT_MAX_REQUESTS="100"

# ========== n8n Integration ==========
N8N_API_URL="https://your-n8n-instance.com/api/v1"
N8N_API_KEY="your-production-n8n-api-key"
N8N_WEBHOOK_SECRET="your-webhook-secret-min-20-characters"

# ========== AI Services ==========
OPENAI_API_KEY="sk-proj-your-production-openai-key"
OPENAI_MODEL="gpt-4-turbo-preview"
OPENAI_MAX_TOKENS="2000"

GROQ_API_KEY="gsk-your-production-groq-key"

# ========== Encryption ==========
ENCRYPTION_KEY="32-character-production-encryption-key-here"

# ========== Logging ==========
LOG_LEVEL="info"
LOG_FORMAT="json"

# ========== WebSocket ==========
WS_PORT="3002"
WS_PATH="/socket.io/"

# ========== Redis (Optional but Recommended) ==========
REDIS_URL="rediss://user:password@host:6379"
REDIS_PASSWORD="your-redis-password"

# ========== Environment ==========
NODE_ENV="production"
PORT="3001"
HOST="0.0.0.0"
```

#### Frontend Environment Variables

Create a `.env.production` file:

```bash
# ========== API Configuration ==========
VITE_API_URL="https://api.yourdomain.com/api/v1"
VITE_WS_URL="wss://api.yourdomain.com"

# ========== Application ==========
VITE_APP_NAME="n8n Marketing Dashboard"
VITE_APP_URL="https://yourdomain.com"

# ========== Analytics (Optional) ==========
VITE_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
VITE_HOTJAR_ID="your-hotjar-id"
```

### Security Best Practices

**Environment Variable Security:**
- Never commit `.env` files to version control
- Use strong, randomly generated secrets
- Rotate secrets regularly (every 90 days)
- Use different secrets for development/staging/production
- Store secrets securely (use platform secret management)

**Generate Secure Secrets:**

```bash
# JWT Secret (32+ characters)
openssl rand -base64 32

# Encryption Key (32 characters)
openssl rand -hex 16

# Webhook Secret
openssl rand -base64 24
```

---

## Database Setup

### Using Supabase (Recommended)

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Click "New Project"
   - Choose organization
   - Set database password (save it securely)
   - Select region closest to your users
   - Wait for project to be ready (~2 minutes)

2. **Get Connection String**
   - Go to Settings > Database
   - Copy "Connection string" (URI format)
   - Replace `[YOUR-PASSWORD]` with your database password
   - Add `?sslmode=require` to end

3. **Run Migrations**
   ```bash
   cd backend

   # Set DATABASE_URL to Supabase connection string
   export DATABASE_URL="postgresql://..."

   # Push schema
   npm run db:push
   ```

4. **Enable Connection Pooling** (Recommended)
   - Go to Settings > Database
   - Enable "Connection pooling"
   - Use pooling mode for serverless functions

### Using Railway PostgreSQL

1. **Create PostgreSQL Database**
   - Go to Railway dashboard
   - Click "New Project" > "Deploy from GitHub"
   - Or select "Add Service" > "Database" > "Add PostgreSQL"

2. **Get Connection String**
   - Click on PostgreSQL service
   - Go to "Variables" tab
   - Copy `DATABASE_URL`

3. **Run Migrations**
   ```bash
   cd backend
   npm run db:push
   ```

### Database Backup Strategy

**Automated Backups (Supabase):**
- Enabled by default
- Retained for 30 days on Pro plan
- Can be downloaded manually

**Manual Backups:**
```bash
# Export database
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Import backup
psql $DATABASE_URL < backup-20260131.sql
```

---

## Backend Deployment

### Option 1: Railway (Recommended)

1. **Prepare for Deployment**
   ```bash
   cd backend
   npm run build
   ```

2. **Create Railway Project**
   - Go to https://railway.app
   - Click "New Project"
   - Select "Deploy from GitHub repo"

3. **Configure Settings**
   - **Root Directory**: `backend`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`

4. **Add Environment Variables**
   - Go to "Variables" tab
   - Add all production environment variables
   - Ensure `DATABASE_URL`, `JWT_SECRET`, `N8N_API_KEY`, etc. are set

5. **Deploy**
   - Railway auto-deploys on push to main branch
   - Monitor deployment logs

6. **Get Deployment URL**
   - Railway provides a URL like `https://your-app.railway.app`
   - Add custom domain in "Settings" > "Domains"

### Option 2: Render

1. **Create Web Service**
   - Go to https://render.com
   - Click "New" > "Web Service"
   - Connect GitHub repository

2. **Configure**
   - **Root Directory**: `backend`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Environment**: Node

3. **Add Environment Variables**
   - Add all required variables
   - Render provides secret management

4. **Deploy**
   - Click "Create Web Service"
   - Render builds and deploys

### Option 3: Fly.io

1. **Install Fly CLI**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login**
   ```bash
   fly auth login
   ```

3. **Launch App**
   ```bash
   cd backend
   fly launch
   ```

4. **Configure**
   - Edit generated `fly.toml`
   - Set environment variables
   - Configure ports

5. **Deploy**
   ```bash
   fly deploy
   ```

### Health Check

After deployment, verify health:

```bash
curl https://api.yourdomain.com/health
```

Expected response:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2026-01-31T12:00:00.000Z",
    "uptime": 123.456,
    "environment": "production"
  }
}
```

---

## Frontend Deployment

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd frontend
   vercel
   ```

4. **Configure Project**
   - **Framework Preset**: Vite
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. **Add Environment Variables**
   ```bash
   VITE_API_URL="https://api.yourdomain.com/api/v1"
   VITE_WS_URL="wss://api.yourdomain.com"
   ```

6. **Set Custom Domain**
   - Go to Vercel dashboard
   - Project Settings > Domains
   - Add your custom domain
   - Configure DNS (A record or CNAME)

7. **Production Deploy**
   ```bash
   vercel --prod
   ```

### Option 2: Netlify

1. **Create Netlify Account**
   - Go to https://netlify.com

2. **Connect Repository**
   - Click "Add new site" > "Import an existing project"
   - Connect GitHub repository

3. **Configure Build**
   - **Branch to deploy**: `main`
   - **Build command**: `cd frontend && npm run build`
   - **Publish directory**: `frontend/dist`

4. **Add Environment Variables**
   - Site Settings > Environment Variables
   - Add frontend env vars

5. **Deploy**
   - Netlify auto-deploys on push

---

## n8n Configuration

### Self-Hosted n8n Setup

#### Option 1: DigitalOcean Droplet

1. **Create Droplet**
   - Go to DigitalOcean
   - Create Droplet (Ubuntu 22.04, 2GB RAM, 1 CPU)
   - Choose region closest to you
   - Add SSH key

2. **Connect to Droplet**
   ```bash
   ssh root@your-droplet-ip
   ```

3. **Install Docker**
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   ```

4. **Install n8n**
   ```bash
   docker run -it --rm \
     --name n8n \
     -p 5678:5678 \
     -e N8N_BASIC_AUTH_ACTIVE=true \
     -e N8N_BASIC_AUTH_USER=admin \
     -e N8N_BASIC_AUTH_PASSWORD=your-secure-password \
     -e WEBHOOK_URL=https://your-n8n-domain.com/ \
     -v ~/.n8n:/home/node/.n8n \
     n8nio/n8n
   ```

5. **Configure Reverse Proxy (Nginx)**
   ```bash
   apt install nginx

   # Edit nginx config
   nano /etc/nginx/sites-available/n8n
   ```

   ```nginx
   server {
       listen 80;
       server_name your-n8n-domain.com;

       location / {
           proxy_pass http://localhost:5678;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

6. **Enable SSL with Let's Encrypt**
   ```bash
   apt install certbot python3-certbot-nginx
   certbot --nginx -d your-n8n-domain.com
   ```

7. **Get API Key**
   - Open n8n in browser
   - Go to Settings > API
   - Create new API key
   - Save to backend environment variables

#### Option 2: Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  n8n:
    image: n8nio/n8n
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=your-password
      - WEBHOOK_URL=https://your-n8n-domain.com/
      - N8N_ENCRYPTION_KEY=your-encryption-key
    volumes:
      - n8n_data:/home/node/.n8n
    restart: always

volumes:
  n8n_data:
```

Deploy:
```bash
docker-compose up -d
```

### n8n Configuration for Dashboard

1. **Configure Webhooks**
   - Go to Settings > Workflow Settings
   - Set "Webhook URL" to your n8n domain
   - Enable "Webhook Authentication"

2. **Create API Key**
   - Settings > API > Create API Key
   - Add to `N8N_API_KEY` environment variable

3. **Test Connection**
   ```bash
   curl -H "X-N8N-API-KEY: your-key" \
     https://your-n8n-domain.com/api/v1/workflows
   ```

---

## Post-Deployment

### Verify Deployment

1. **Frontend Health Check**
   - Visit https://yourdomain.com
   - Check all pages load
   - Test navigation
   - Verify responsive design

2. **Backend Health Check**
   ```bash
   curl https://api.yourdomain.com/health
   ```

3. **Database Connection**
   - Check backend logs for connection errors
   - Verify Prisma queries work
   - Test authentication flow

4. **n8n Connection**
   - Test webhook endpoint
   - Verify workflow creation
   - Check execution logs

### Smoke Tests

**Test Authentication:**
```bash
curl -X POST https://api.yourdomain.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPassword123!"}'
```

**Test API with Token:**
```bash
curl https://api.yourdomain.com/api/v1/workflows \
  -H "Authorization: Bearer your-token-here"
```

**Test WebSocket Connection:**
```javascript
const io = require('socket.io-client');

const socket = io('wss://api.yourdomain.com', {
  path: '/socket.io/',
  auth: { token: 'your-token' }
});

socket.on('connect', () => {
  console.log('Connected!');
  socket.disconnect();
});
```

---

## Monitoring and Maintenance

### Application Monitoring

**Use Recommended Services:**

1. **Sentry** (Error Tracking)
   - Create account at https://sentry.io
   - Install SDK:
     ```bash
     npm install @sentry/node
     ```
   - Configure in backend:
     ```typescript
     import * as Sentry from '@sentry/node';

     Sentry.init({
       dsn: process.env.SENTRY_DSN,
       environment: process.env.NODE_ENV,
     });
     ```

2. **LogRocket** (Session Replay)
   - Add to frontend:
     ```bash
     npm install logrocket
     ```
   - Initialize in App.tsx:
     ```typescript
     import LogRocket from 'logrocket';

     LogRocket.init('your-app-id');
     ```

3. **Uptime Monitoring**
   - UptimeRobot (free)
   - Pingdom
   - StatusCake

4. **Analytics**
   - Google Analytics 4
   - Plausible (privacy-friendly)
   - PostHog (product analytics)

### Logging Strategy

**Backend Logging (Winston):**
```javascript
logger.info('User action', {
  userId: user.id,
  action: 'workflow_created',
  workflowId: workflow.id,
});
```

**Log Levels:**
- `error`: Critical errors requiring immediate attention
- `warn`: Warnings that should be investigated
- `info`: General informational messages
- `debug`: Detailed debugging info (development only)

### Performance Monitoring

**Key Metrics to Track:**
- API response time (P50, P95, P99)
- Database query time
- Error rate
- CPU and memory usage
- WebSocket connection count
- Active user count

**Set Up Alerts:**
- Error rate > 5%
- API response time > 1s (P95)
- Database connection failures
- Disk space < 20%
- Memory usage > 80%

---

## Backup and Recovery

### Database Backups

**Automated Backups:**
- Enable in your database hosting platform
- Recommended: Daily backups, 30-day retention
- Test restore process quarterly

**Manual Backup Script:**
```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/postgres"
mkdir -p $BACKUP_DIR

pg_dump $DATABASE_URL | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Keep last 7 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: backup_$DATE.sql.gz"
```

**Restore from Backup:**
```bash
gunzip < backup_20260131_120000.sql.gz | psql $DATABASE_URL
```

### Workflow Backups

Workflows are stored in the database and n8n:
1. Database backups include workflow definitions
2. n8n has its own backup system
3. Export critical workflows manually:
   - Open workflow in n8n editor
   - Click "..." > "Download"
   - Save JSON file

### Disaster Recovery Plan

**Scenario 1: Database Corruption**
1. Stop application deployment
2. Identify last good backup
3. Restore database
4. Run data integrity checks
5. Restart application
6. Monitor logs for issues

**Scenario 2: Backend Server Failure**
1. Platform auto-restarts (Railway/Render)
2. If persistent failure, deploy to new instance
3. Update DNS if IP changes
4. Monitor health endpoint

**Scenario 3: n8n Instance Down**
1. Check server status
2. Restart Docker container if needed
3. If unrecoverable, restore from backup
4. Update `N8N_API_URL` if changed

---

## Cost Optimization

### Estimated Monthly Costs (Small Team)

- Frontend (Vercel Hobby): Free
- Backend (Railway Starter): $5
- Database (Supabase Pro): $25
- n8n (DigitalOcean): $24
- Domain: $1-2/month
- SSL Certificates: Free (Let's Encrypt)
- Monitoring (Sentry): Free tier
- **Total**: ~$55-60/month

### Optimization Tips

1. **Use Free Tiers**
   - Vercel Hobby (free)
   - Railway Starter ($5)
   - Supabase free tier (development)

2. **Scale Vertically Before Horizontally**
   - Upgrade existing instances
   - Add more RAM/CPU
   - Cheaper than multiple instances

3. **Optimize Database Queries**
   - Add indexes
   - Use connection pooling
   - Cache frequently accessed data

4. **CDN for Assets**
   - Use Vercel's built-in CDN
   - Cache images and static files
   - Reduce bandwidth costs

5. **Monitor Usage**
   - Set budget alerts
   - Review usage monthly
   - Identify waste

---

## CI/CD Pipeline

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: cd backend && npm ci
      - run: cd backend && npm run build
      - uses: railwayapp/cli-action@v1
        with:
          service: your-backend-service-id
          command: up

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: cd frontend && npm ci
      - run: cd frontend && npm run build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./frontend
```

---

## Troubleshooting

### Common Deployment Issues

**Issue: Build Fails**
- Check Node.js version (must be 20+)
- Verify all dependencies are installed
- Check build logs for specific errors
- Ensure environment variables are set

**Issue: Database Connection Refused**
- Verify `DATABASE_URL` is correct
- Check firewall rules
- Ensure SSL mode is correct
- Verify database is running

**Issue: CORS Errors**
- Add frontend domain to `CORS_ORIGIN`
- Check `VITE_API_URL` in frontend
- Verify API calls use correct base URL

**Issue: WebSocket Connection Fails**
- Check `VITE_WS_URL` is correct
- Ensure WebSocket path matches
- Verify `WS_PORT` in backend
- Check firewall allows WebSocket

**Issue: n8n Webhook Timeout**
- Increase webhook timeout in n8n settings
- Check network connectivity
- Verify webhook URL is accessible publicly

### Getting Help

- **Documentation**: `/docs`
- **Issues**: GitHub Issues
- **Support**: support@yourdomain.com
- **Status**: status.yourdomain.com

---

**Version:** 1.0.0
**Last Updated:** 2026-01-31
