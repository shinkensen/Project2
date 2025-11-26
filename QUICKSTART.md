# Smart Fridge Manager - Quick Start Guide

## 🚀 5-Minute Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Supabase (5 minutes)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. **Database Setup**:
   - Click "SQL Editor" in left menu
   - Copy all content from `database/schema.sql`
   - Paste and click "Run"
4. **Storage Setup**:
   - Click "Storage" in left menu
   - Click "New bucket"
   - Name: `fridge-images`, Type: Private
   - Click the bucket → Policies → Add policies from `database/SETUP.md`
5. **Get Credentials**:
   - Click "Settings" → "API"
   - Copy `URL`, `anon public` key, and `service_role` key

### 3. Configure Environment

Create `.env` file (copy from `.env.example`):

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your.email@gmail.com
EMAIL_PASSWORD=your-app-password

PORT=3000
APP_URL=http://localhost:3000
```

### 4. Gmail Setup (Optional - for notifications)

1. Go to [myaccount.google.com/security](https://myaccount.google.com/security)
2. Enable "2-Step Verification"
3. Search for "App passwords"
4. Generate password for "Mail"
5. Use this password in `EMAIL_PASSWORD`

### 5. Get API Keys (Optional - for better recipes)

**Spoonacular** (recommended):
- Go to [spoonacular.com/food-api](https://spoonacular.com/food-api)
- Sign up (free tier: 150 requests/day)
- Add key to `.env`: `SPOONACULAR_API_KEY=your-key`

### 6. Start the App

```bash
npm start
```

Open browser to `http://localhost:3000`

## ✅ Test Your Setup

1. Click "Get Started" → Create an account
2. Verify email (check inbox)
3. Sign in
4. Upload a test image (any food photo)
5. Check if CV detection works
6. Add an item with expiration date tomorrow
7. Wait for email notification (runs at 9 AM daily, or trigger manually via `/api/trigger-notifications`)

## 🆘 Common Issues

**"Failed to connect to Supabase"**
- Check `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct
- Verify Supabase project is active

**"Upload failed"**
- Ensure storage bucket `fridge-images` exists
- Check storage policies are set correctly

**"Email not sending"**
- For Gmail, use App Password (not regular password)
- Enable 2FA first on Google account

**"CV detection not working"**
- Use Chrome, Firefox, or Edge (not IE)
- Large images may take 10-20 seconds
- Check browser console for errors

## 📱 What to Try

1. **Upload a fridge photo** - Test CV detection
2. **Add items manually** - Try the full form
3. **Set expiration dates** - See the color coding
4. **Browse recipes** - Check recipe suggestions
5. **Adjust settings** - Configure notifications
6. **Mark items as used** - Track consumption

## 🎯 Next Steps

- Add real food items to your fridge
- Set up email notifications
- Get Spoonacular API key for better recipes
- Invite family members (create multiple accounts)
- Check dashboard daily for expiring items

## 💡 Tips

- Use clear, well-lit photos for best CV detection
- Photos of individual items work better than full fridge shots
- Set realistic expiration dates (app provides estimates)
- Check dashboard regularly for expiring items
- Save favorite recipes for quick access

---

Need help? Check the full `README.md` or `database/SETUP.md` for detailed instructions.
