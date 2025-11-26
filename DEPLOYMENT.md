# 📦 Deployment Guide

## Deployment Options

### Option 1: Vercel (Recommended for Serverless)

1. **Prepare for Vercel**
   - Install Vercel CLI: `npm i -g vercel`
   - Create `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

2. **Deploy**
```bash
vercel
```

3. **Set Environment Variables**
   - Go to Vercel dashboard → Your project → Settings → Environment Variables
   - Add all variables from `.env`

### Option 2: Heroku

1. **Create Heroku App**
```bash
heroku create your-app-name
```

2. **Set Environment Variables**
```bash
heroku config:set SUPABASE_URL=your_url
heroku config:set SUPABASE_ANON_KEY=your_key
# ... set all variables
```

3. **Deploy**
```bash
git push heroku main
```

### Option 3: Railway

1. **Install Railway CLI**
```bash
npm i -g @railway/cli
```

2. **Initialize and Deploy**
```bash
railway login
railway init
railway up
```

3. **Set Variables**
   - Go to Railway dashboard
   - Add environment variables

### Option 4: DigitalOcean App Platform

1. **Connect Repository**
   - Go to DigitalOcean App Platform
   - Connect your GitHub repository

2. **Configure**
   - Build Command: `npm install`
   - Run Command: `npm start`
   - Port: 3000

3. **Add Environment Variables**
   - Add all variables from `.env` in the settings

### Option 5: Self-Hosted (VPS)

1. **Server Setup** (Ubuntu/Debian)
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2
```

2. **Deploy Application**
```bash
# Clone repository
git clone your-repo-url
cd smart-fridge-manager

# Install dependencies
npm install

# Create .env file
nano .env
# (paste your environment variables)

# Start with PM2
pm2 start server.js --name smart-fridge
pm2 save
pm2 startup
```

3. **Set up Nginx (optional)**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

4. **SSL with Let's Encrypt**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## Production Checklist

### Before Deployment

- [ ] Update `APP_URL` in `.env` to your production URL
- [ ] Set `NODE_ENV=production`
- [ ] Review and set all environment variables
- [ ] Test all features locally
- [ ] Update Supabase URL allowed origins
- [ ] Configure CORS if needed
- [ ] Review security settings

### Supabase Production Settings

1. **Update Site URL**
   - Go to Authentication → URL Configuration
   - Add your production URL

2. **Email Templates**
   - Customize email templates in Authentication → Email Templates
   - Update links to production URL

3. **Rate Limiting**
   - Review and adjust rate limits if needed
   - Enable additional security features

### Post-Deployment

- [ ] Test user registration
- [ ] Test image upload
- [ ] Verify email notifications work
- [ ] Test all CRUD operations
- [ ] Check mobile responsiveness
- [ ] Monitor error logs
- [ ] Set up monitoring (e.g., Sentry)

## Environment Variables Reference

```bash
# Required
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Required for notifications
EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASSWORD=

# Optional but recommended
SPOONACULAR_API_KEY=
EDAMAM_APP_ID=
EDAMAM_APP_KEY=

# Server config
PORT=3000
NODE_ENV=production
APP_URL=https://yourdomain.com
```

## Monitoring & Maintenance

### Logging

Add logging service (recommended: LogRocket, Sentry):

```javascript
// In server.js
if (process.env.NODE_ENV === 'production') {
  const Sentry = require('@sentry/node');
  Sentry.init({ dsn: process.env.SENTRY_DSN });
}
```

### Database Backups

Supabase automatically backs up your database. To create manual backups:

1. Go to Supabase Dashboard
2. Database → Backups
3. Create manual backup

### Updates

```bash
# Pull latest changes
git pull origin main

# Install new dependencies
npm install

# Restart application
pm2 restart smart-fridge
```

## Scaling Considerations

### Performance Optimization

1. **Enable CDN** for static assets
2. **Compress images** before upload
3. **Cache recipe API responses**
4. **Use Redis** for session storage (optional)

### Database Optimization

1. Add indexes for frequently queried columns
2. Set up read replicas for heavy read operations
3. Monitor query performance

### Cost Optimization

1. **Supabase**: Free tier supports up to 500MB database, 1GB file storage
2. **API Keys**: Monitor usage to stay within free tiers
3. **Email**: Consider alternatives like SendGrid free tier (100 emails/day)

## Troubleshooting Production Issues

### 502 Bad Gateway
- Check if Node.js process is running
- Verify port configuration
- Check server logs

### Database Connection Issues
- Verify Supabase credentials
- Check if IP is whitelisted
- Test connection from server

### Email Not Sending
- Verify email credentials
- Check spam folder
- Review email service logs
- Consider using SendGrid or AWS SES for production

## Security Best Practices

1. **Never commit `.env` file**
2. **Use HTTPS only in production**
3. **Enable Supabase Row Level Security**
4. **Implement rate limiting**
5. **Regular security updates**: `npm audit fix`
6. **Monitor suspicious activities**
7. **Use strong passwords for admin accounts**

## Support & Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Vercel Documentation](https://vercel.com/docs)
- [PM2 Documentation](https://pm2.keymetrics.io/)

---

Need help with deployment? Check the troubleshooting section or create an issue on GitHub.
