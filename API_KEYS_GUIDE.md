# Smart Fridge Manager - API Keys Guide

## Required APIs

### 1. Supabase (Required)

**What it's for**: Database, authentication, and file storage

**Cost**: Free tier includes:
- 500MB database
- 1GB file storage
- 50,000 monthly active users
- 2GB bandwidth

**Setup**:
1. Go to [supabase.com](https://supabase.com)
2. Sign up with GitHub or email
3. Create a new project (takes 2-3 minutes)
4. Get credentials from Settings → API

**You need**:
- `SUPABASE_URL`: Your project URL
- `SUPABASE_ANON_KEY`: Public anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Service role secret key

---

### 2. Email Service (Required for Notifications)

#### Option A: Gmail (Easiest)

**Cost**: Free

**Setup**:
1. Use your Gmail account
2. Enable 2-Step Verification in [Google Account Security](https://myaccount.google.com/security)
3. Generate App Password:
   - Go to Security → 2-Step Verification → App passwords
   - Select "Mail" and generate
4. Use generated password (not your regular Gmail password)

**You need**:
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your.email@gmail.com
EMAIL_PASSWORD=your-app-password (16 characters)
```

**Limits**: 
- 500 emails per day
- 100 recipients per email

#### Option B: SendGrid (Scalable)

**Cost**: Free tier - 100 emails/day

**Setup**:
1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Create an API key
3. Use these settings:

```
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
```

#### Option C: Mailgun

**Cost**: Free tier - 5,000 emails/month for 3 months

**Setup**:
1. Sign up at [mailgun.com](https://www.mailgun.com/)
2. Verify domain (or use sandbox)
3. Get SMTP credentials

---

### 3. Recipe APIs (Optional but Recommended)

#### Option A: Spoonacular (Recommended)

**What it's for**: Recipe suggestions, ingredient matching, nutritional info

**Cost**: 
- Free tier: 150 requests/day
- Paid: Starting at $49/month for 5,000 requests/day

**Pros**:
- Excellent recipe database
- Smart ingredient matching
- Nutritional information
- Easy to use

**Setup**:
1. Go to [spoonacular.com/food-api](https://spoonacular.com/food-api)
2. Click "Get Started"
3. Sign up for free account
4. Go to Dashboard → My Console
5. Copy your API key

**You need**:
```
SPOONACULAR_API_KEY=your-api-key
```

**Rate Limits**:
- Free: 150 requests/day
- Requests reset at midnight UTC

**Usage Tips**:
- Cache recipe results
- Batch ingredient searches
- Use mock recipes as fallback

#### Option B: Edamam Recipe API (Alternative)

**Cost**:
- Free tier: 5,000 requests/month
- Paid: Starting at $29/month

**Setup**:
1. Go to [developer.edamam.com](https://developer.edamam.com/)
2. Sign up for Recipe Search API
3. Get credentials from dashboard

**You need**:
```
EDAMAM_APP_ID=your-app-id
EDAMAM_APP_KEY=your-app-key
```

---

### 4. Food Data APIs (Optional)

#### Open Food Facts (Free)

**What it's for**: Food product information, nutritional data, shelf life estimates

**Cost**: Free (open source project)

**Setup**: No API key needed, just use their API directly

The app uses this automatically for food information.

---

## API Key Storage

### Development

Store keys in `.env` file (never commit this!):

```bash
# Copy example file
cp .env.example .env

# Edit with your keys
nano .env  # or use any text editor
```

### Production

Set environment variables in your hosting platform:

**Vercel**:
```bash
vercel env add SUPABASE_URL
vercel env add SPOONACULAR_API_KEY
```

**Heroku**:
```bash
heroku config:set SUPABASE_URL=your_url
```

**Railway/DigitalOcean**: Use dashboard to add environment variables

---

## Cost Breakdown (Monthly)

### Minimal Setup (FREE)
- Supabase: Free tier
- Gmail: Free
- No recipe API: Uses mock recipes
- **Total: $0/month**

### Recommended Setup (FREE)
- Supabase: Free tier
- Gmail: Free
- Spoonacular: Free tier (150 requests/day)
- **Total: $0/month**

### Production Setup (Low Usage)
- Supabase: Free tier
- SendGrid: Free tier (100 emails/day)
- Spoonacular: Free tier
- **Total: $0/month**

### Production Setup (Medium Usage)
- Supabase: Free tier
- SendGrid: $19.95/month (40,000 emails)
- Spoonacular: $49/month (5,000 recipes/day)
- **Total: ~$70/month**

---

## API Usage Best Practices

### Rate Limiting

1. **Cache Results**
   - Store recipe searches in database
   - Reuse results for 24 hours

2. **Batch Requests**
   - Group multiple items in one API call
   - Use bulk endpoints when available

3. **Implement Fallbacks**
   - Use mock data when API fails
   - Show cached results while fetching new data

### Monitoring

Track your API usage:

**Spoonacular**:
- Dashboard shows daily usage
- Set up alerts for 80% quota

**SendGrid/Mailgun**:
- Check email dashboard daily
- Monitor bounce rates

**Supabase**:
- Monitor database size
- Check bandwidth usage

---

## Troubleshooting

### API Key Not Working

1. **Check format**: Remove extra spaces/quotes
2. **Verify key is active**: Check API dashboard
3. **Test key**: Use API testing tools (Postman, curl)

### Rate Limit Exceeded

**Spoonacular**:
```
Error: 402 Payment Required - Daily quota exceeded
```
**Solution**: Wait until midnight UTC or upgrade plan

**SendGrid**:
```
Error: 550 Daily sending quota exceeded
```
**Solution**: Wait 24 hours or upgrade plan

### Email Not Sending

1. **Gmail**: Use App Password, not regular password
2. **2FA**: Must be enabled for Gmail
3. **Test credentials**: Use online SMTP tester
4. **Check spam**: Emails might be filtered

---

## Getting Help

- **Supabase**: [discord.supabase.com](https://discord.supabase.com)
- **Spoonacular**: support@spoonacular.com
- **SendGrid**: [support.sendgrid.com](https://support.sendgrid.com)

---

## Quick Setup Summary

**Minimum to get started**:
1. ✅ Supabase account (5 min)
2. ✅ Gmail with App Password (5 min)
3. ⚠️ Spoonacular API key (optional, 2 min)

**Time to setup**: ~10-15 minutes
**Cost**: $0/month

You can always add more APIs later as needed!
