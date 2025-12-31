# Production Deployment Guide

## Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Docker Deployment](#docker-deployment)
- [CI/CD Pipeline](#cicd-pipeline)
- [Production Checklist](#production-checklist)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- Node.js 20+ (for local development)
- Docker 24+ & Docker Compose 2.20+
- Git
- nginx (for production server)
- SSL certificates (Let's Encrypt recommended)

### Required Accounts & Services
- GitHub (for CI/CD)
- Docker Hub (for container registry)
- Sentry (for error tracking)
- Intercom (for customer support)
- Stripe (for payments)
- Domain name & DNS configured

---

## Environment Configuration

### 1. Production Environment Variables

Create `/opt/recruiting-dashboard/.env.production`:

```env
# Application
VITE_APP_VERSION=1.0.0
VITE_APP_NAME="Recruiting Dashboard"

# API Configuration
VITE_API_URL=https://api.your-domain.com
VITE_API_TIMEOUT=30000

# Production Integrations
VITE_SENTRY_DSN=https://YOUR_SENTRY_DSN@sentry.io/YOUR_PROJECT
VITE_INTERCOM_APP_ID=YOUR_INTERCOM_APP_ID
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_STRIPE_KEY

# Feature Flags
VITE_ENABLE_AI_FEATURES=true
VITE_ENABLE_WORKFLOW_ENGINE=true
VITE_ENABLE_MULTI_TENANCY=true

# Analytics (Optional)
VITE_GA_TRACKING_ID=UA-XXXXXXXXX-X
VITE_MIXPANEL_TOKEN=YOUR_MIXPANEL_TOKEN
```

### 2. Backend Environment Variables

```env
# Database
MONGODB_URI=mongodb://mongodb:27017/recruiting
REDIS_URL=redis://redis:6379

# Authentication
JWT_SECRET=YOUR_SECURE_JWT_SECRET
JWT_EXPIRES_IN=7d

# Email (SendGrid)
SENDGRID_API_KEY=SG.YOUR_SENDGRID_KEY
FROM_EMAIL=noreply@your-domain.com

# Stripe
STRIPE_SECRET_KEY=sk_live_YOUR_STRIPE_SECRET
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET

# Sentry
SENTRY_DSN=https://YOUR_SENTRY_DSN@sentry.io/YOUR_PROJECT

# Storage (AWS S3)
AWS_ACCESS_KEY_ID=YOUR_AWS_KEY
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET
AWS_BUCKET_NAME=recruiting-dashboard-uploads
AWS_REGION=us-east-1
```

---

## Docker Deployment

### 1. Build Docker Image

```bash
# Build production image
docker build -t recruiting-dashboard:latest .

# Test locally
docker run -p 3000:80 recruiting-dashboard:latest
```

### 2. Deploy with Docker Compose

```bash
# On production server
cd /opt/recruiting-dashboard

# Pull latest images
docker-compose pull

# Start services
docker-compose up -d

# View logs
docker-compose logs -f frontend

# Check status
docker-compose ps
```

### 3. Update Deployment

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose up -d --build

# Clean up old images
docker system prune -f
```

---

## CI/CD Pipeline

### GitHub Secrets Configuration

Add these secrets in GitHub repository settings:

```
DOCKER_USERNAME         # Docker Hub username
DOCKER_PASSWORD         # Docker Hub password/token
PROD_SERVER_HOST        # Production server IP/hostname
PROD_SERVER_USER        # SSH username
PROD_SERVER_SSH_KEY     # SSH private key
SLACK_WEBHOOK           # Slack webhook URL (optional)
CODECOV_TOKEN           # Codecov token (optional)
```

### Pipeline Stages

1. **Test** - Lint, unit tests, coverage
2. **Build** - Build application, analyze bundle
3. **Docker** - Build and push Docker image
4. **Deploy** - Deploy to production (main branch only)

### Manual Deployment

```bash
# Trigger deployment manually
git tag v1.0.0
git push origin v1.0.0

# Or push to main branch
git push origin main
```

---

## Production Checklist

### Pre-Deployment

- [ ] All environment variables configured
- [ ] SSL certificates installed
- [ ] Database migrations run
- [ ] Backup strategy in place
- [ ] Monitoring tools configured
- [ ] DNS records configured
- [ ] CDN configured (optional)

### Security

- [ ] Enable HTTPS only
- [ ] Configure CORS properly
- [ ] Set security headers (X-Frame-Options, CSP, etc.)
- [ ] Enable rate limiting
- [ ] Configure firewall rules
- [ ] Disable debug mode
- [ ] Review and rotate secrets
- [ ] Enable 2FA for admin accounts

### Performance

- [ ] Enable gzip/brotli compression
- [ ] Configure CDN caching
- [ ] Set appropriate cache headers
- [ ] Optimize database indexes
- [ ] Enable Redis caching
- [ ] Configure connection pooling
- [ ] Run Lighthouse audit (score ≥ 90)

### Monitoring

- [ ] Sentry error tracking active
- [ ] Server monitoring (CPU, memory, disk)
- [ ] Application performance monitoring
- [ ] Uptime monitoring (UptimeRobot, Pingdom)
- [ ] Log aggregation (CloudWatch, Datadog)
- [ ] Set up alerts for critical errors

### Testing

- [ ] Run smoke tests
- [ ] Test all critical user flows
- [ ] Verify payment processing
- [ ] Test email delivery
- [ ] Verify file uploads
- [ ] Test across browsers
- [ ] Test mobile responsiveness
- [ ] Load testing completed

---

## nginx Configuration (Standalone)

If not using Docker, configure nginx directly:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Serve static files
    root /var/www/recruiting-dashboard/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/javascript application/json;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API proxy
    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

---

## Monitoring & Maintenance

### Daily Checks
- Check error rates in Sentry
- Review server logs
- Monitor uptime status
- Check API response times

### Weekly Maintenance
- Review and respond to support tickets
- Update dependencies (security patches)
- Review analytics data
- Check backup integrity

### Monthly Tasks
- Update application (minor versions)
- Review and optimize database
- Security audit
- Performance optimization review
- Cost analysis

### Backup Strategy

```bash
# Automated daily backups
0 2 * * * /opt/scripts/backup-mongodb.sh
0 3 * * * /opt/scripts/backup-uploads.sh

# Retention: 7 daily, 4 weekly, 12 monthly
```

---

## Troubleshooting

### Application Won't Start

```bash
# Check logs
docker-compose logs frontend

# Check environment variables
docker-compose config

# Restart services
docker-compose restart frontend
```

### High Memory Usage

```bash
# Check container stats
docker stats

# Increase memory limit in docker-compose.yml
services:
  frontend:
    mem_limit: 512m
```

### Slow Performance

1. Check bundle size: `npm run build:analyze`
2. Review database queries (add indexes)
3. Enable Redis caching
4. Configure CDN
5. Review Sentry performance traces

### SSL Certificate Issues

```bash
# Renew Let's Encrypt certificate
sudo certbot renew

# Test renewal
sudo certbot renew --dry-run
```

---

## Support & Resources

- **Documentation:** https://docs.your-domain.com
- **Status Page:** https://status.your-domain.com
- **Support Email:** support@your-domain.com
- **GitHub Issues:** https://github.com/your-org/recruiting-dashboard/issues

---

## Version History

- **v1.0.0** (2025-01-01) - Initial production release
- **v0.9.0** (2024-12-31) - Beta release
