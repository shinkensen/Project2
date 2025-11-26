# Smart Fridge Manager - Quick Start Guide

## 🚀 Complete Setup Guide (15-20 minutes)

Follow these steps in order to get your app running.

---

## Prerequisites

Before starting, ensure you have:
- ✅ **Node.js v16 or higher** installed ([download](https://nodejs.org))
- ✅ **A web browser** (Chrome, Firefox, or Edge recommended)
- ✅ **Internet connection** for Supabase setup

---

## Step 1: Install Dependencies (2 minutes)

Open PowerShell/Terminal in the project folder and run:

```powershell
npm install
```

**Expected output:** "added 96 packages" with no errors.

**Troubleshooting:**
- ❌ If you see build errors: The app no longer requires build tools - make sure you pulled the latest code
- ❌ If npm is not recognized: Install Node.js from [nodejs.org](https://nodejs.org)

---

## Step 2: Set Up Supabase Database (8-10 minutes)

### 2.1 Create Supabase Account & Project

1. **Go to [supabase.com](https://supabase.com)** and click "Start your project"
2. **Sign up** using GitHub (easiest) or email
3. **Create a new organization** (you'll be prompted)
   - Name: anything you like (e.g., "MyApps")
   - Plan: Free (no credit card required)
4. **Create a new project**
   - Project name: `smart-fridge-manager` (or any name)
   - Database password: **Save this!** You'll need it later
   - Region: Choose closest to you
   - Click "Create new project"
   - ⏱️ **Wait 2-3 minutes** for project to be provisioned

### 2.2 Set Up Database Schema

Once your project is ready:

1. **Click "SQL Editor"** in the left sidebar (under "Database")
2. **Click "+ New query"** button (top right)
3. **Open the file** `database/schema.sql` in your code editor
4. **Copy ALL the content** (it's ~200+ lines of SQL)
5. **Paste into Supabase SQL Editor**
6. **Click "Run"** (or press Ctrl+Enter)
7. **Wait for success message** - you should see "Success. No rows returned"

**What this does:** Creates all database tables, security policies, and triggers.

### 2.3 Create Storage Bucket

1. **Click "Storage"** in the left sidebar
2. **Click "New bucket"** button
3. **Bucket settings:**
   - Name: `fridge-images` (must be exact)
   - Public bucket: **OFF** (keep it private)
   - File size limit: 50MB
   - Allowed MIME types: leave default
4. **Click "Create bucket"**

### 2.4 Set Up Storage Policies

After creating the bucket:

1. **Click on `fridge-images` bucket** (the one you just created)
2. **Click "Policies"** tab at the top
3. **Click "New policy"** button

IMPORTANT: Supabase's UI offers several templates, but templates may vary by project or UI version. If you don't see a template called "Enable insert for authenticated users only", use the custom policy flow and paste the SQL expressions below (or create the policies with the UI fields shown). Both approaches are equivalent.

4. **Create an INSERT (upload) policy — via UI or SQL**

- UI (recommended):
   - Click "New policy" → "For full customization"
   - Policy name: `Users can insert to own folder`
   - Role: `authenticated`
   - Action (Policy definition): `INSERT`
   - WITH CHECK expression (paste exactly):
      ```sql
      bucket_id = 'fridge-images' AND (storage.foldername(name))[1] = auth.uid()
      ```
   - Click "Review" then "Save policy"

- SQL (alternative): Open the **SQL Editor** and run the following three statements to create INSERT/SELECT/DELETE policies for `storage.objects`:
   ```sql
   -- Allow authenticated users to INSERT objects only into their own top-level folder
   CREATE POLICY "Users can insert to own folder"
      ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (
         bucket_id = 'fridge-images' AND (storage.foldername(name))[1] = auth.uid()
      );
   ```

5. **Create a SELECT (read) policy**

- UI:
   - Click "New policy" → "For full customization"
   - Policy name: `Users can select own objects`
   - Role: `authenticated`
   - Action: `SELECT`
   - USING expression (paste exactly):
      ```sql
      bucket_id = 'fridge-images' AND (storage.foldername(name))[1] = auth.uid()
      ```
   - Click "Review" then "Save policy"

- SQL (alternative):
   ```sql
   CREATE POLICY "Users can select own objects"
      ON storage.objects
      FOR SELECT
      TO authenticated
      USING (
         bucket_id = 'fridge-images' AND (storage.foldername(name))[1] = auth.uid()
      );
   ```

6. **Create a DELETE policy**

- UI:
   - Click "New policy" → "For full customization"
   - Policy name: `Users can delete own images`
   - Role: `authenticated`
   - Action: `DELETE`
   - WITH CHECK expression:
      ```sql
      bucket_id = 'fridge-images' AND (storage.foldername(name))[1] = auth.uid()
      ```
   - Click "Review" then "Save policy"

- SQL (alternative):
   ```sql
   CREATE POLICY "Users can delete own objects"
      ON storage.objects
      FOR DELETE
      TO authenticated
      WITH CHECK (
         bucket_id = 'fridge-images' AND (storage.foldername(name))[1] = auth.uid()
      );
   ```

Notes:
- `storage.foldername(name)` is a Supabase helper that splits object paths; index `[1]` returns the top-level folder (we use it to ensure each user can only act inside a folder named with their `auth.uid()`).
- If your front-end uploads objects using the path `${userId}/filename.jpg`, these policies will ensure users can only read/upload/delete objects inside their own folder.
- After creating policies, test with an authenticated user and try uploading to `fridge-images/<your-uid>/test.jpg` to confirm permissions.

### 2.5 Get Your API Credentials

1. **Click "Settings"** (gear icon in left sidebar)
2. **Click "API"** in the settings menu
3. **Copy these THREE values:**
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **Project API keys** → `anon` `public` (long string starting with "eyJ...")
   - **Project API keys** → `service_role` (another long string)

**⚠️ IMPORTANT:** Keep the `service_role` key secret - never commit to Git!

---

## Step 3: Configure Environment Variables (3 minutes)

### 3.1 Create `.env` File

In PowerShell, run:

```powershell
Copy-Item .env.example .env
```

Or manually create a new file named `.env` in the project root.

### 3.2 Edit `.env` File

Open `.env` and fill in your Supabase credentials:

```env
# ===== REQUIRED: Supabase Configuration =====
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ...

# ===== OPTIONAL: Email Notifications =====
# Leave these empty if you don't want email notifications yet
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASSWORD=

# ===== OPTIONAL: Recipe API =====
# Leave empty to use mock recipes
SPOONACULAR_API_KEY=

# ===== Server Configuration =====
PORT=3000
NODE_ENV=development
APP_URL=http://localhost:3000
```

**Save the file!**

---

## Step 4: Start the Application (1 minute)

In PowerShell, run:

```powershell
npm start
```

**Expected output:**
```
🚀 Server running on http://localhost:3000
📧 Notification scheduler started
```

**Troubleshooting:**
- ❌ "supabaseUrl is required" - Check your `.env` file has the correct values
- ❌ "Port 3000 already in use" - Change `PORT=3001` in `.env` or stop other apps using port 3000
- ❌ Module errors - Run `npm install` again

---

## Step 5: Test the Application (2 minutes)

1. **Open browser** to `http://localhost:3000`
2. **Click "Get Started"** or "Sign Up"
3. **Create an account:**
   - Full name: Your name
   - Email: Use a real email (you'll get verification)
   - Password: At least 6 characters
   - Click "Create Account"
4. **Check your email** for verification link
5. **Click the verification link** in the email
6. **Sign in** with your credentials

**Success!** You should see the dashboard.

---

## Optional Step 6: Gmail Notifications (5 minutes)

To enable expiration email notifications:

### 6.1 Enable 2-Factor Authentication

1. Go to [myaccount.google.com/security](https://myaccount.google.com/security)
2. Scroll to "How you sign in to Google"
3. Click "2-Step Verification"
4. Follow prompts to enable (need phone number)

### 6.2 Generate App Password

1. After enabling 2FA, search for **"App passwords"** on the same page
2. Click "App passwords"
3. In "Select app" dropdown, choose **"Mail"**
4. In "Select device" dropdown, choose **"Windows Computer"** (or your OS)
5. Click **"Generate"**
6. **Copy the 16-character password** (spaces don't matter)

### 6.3 Update `.env`

```env
EMAIL_USER=your.email@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
```

### 6.4 Restart Server

Stop server (Ctrl+C) and run `npm start` again.

**Test notifications:**
1. Add a food item with expiration date = tomorrow
2. Send test notification: POST to `http://localhost:3000/api/trigger-notifications`
3. Check your email inbox

---

## Optional Step 7: Recipe API (3 minutes)

For better recipe suggestions:

### 7.1 Get Spoonacular API Key

1. Go to [spoonacular.com/food-api](https://spoonacular.com/food-api)
2. Click "Get Started" → "Pricing"
3. Click "Start Now" under Free plan
4. Sign up with email
5. Verify your email
6. Go to [My Console](https://spoonacular.com/food-api/console#Dashboard)
7. Copy your **API Key**

### 7.2 Add to `.env`

```env
SPOONACULAR_API_KEY=your_api_key_here
```

### 7.3 Restart Server

**Note:** Without this, app uses mock recipes (works fine for testing).

---

## ✅ Testing Checklist

### Basic Tests (Must Work)

- [ ] **Homepage loads** - See landing page at `http://localhost:3000`
- [ ] **Sign up works** - Create account, receive verification email
- [ ] **Email verification** - Click link in email, get redirected
- [ ] **Sign in works** - Log in with credentials
- [ ] **Dashboard loads** - See stats (all zeros initially)
- [ ] **Settings page** - Can view/update profile

### Feature Tests (Try These)

- [ ] **Manual item entry** - Click "My Fridge" → "Add Manually" → Fill form → Save
- [ ] **View fridge items** - See the item you added
- [ ] **Edit item** - Click item → Edit → Change expiration date
- [ ] **Mark as used** - Click "Used" button on an item
- [ ] **Search/filter** - Try search box and category filters
- [ ] **Recipe suggestions** - Add a few items, check "Recipes" tab

### Advanced Tests (If Configured)

- [ ] **Photo upload** - Upload food photo (wait for TensorFlow to load on first use)
- [ ] **CV detection** - See detected food items
- [ ] **Email notification** - Trigger test: `POST http://localhost:3000/api/trigger-notifications`

---

## 🆘 Troubleshooting Guide

### Installation Issues

**❌ "npm install failed"**
```powershell
# Clean and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

**❌ "Cannot find module"**
- Make sure you ran `npm install` successfully
- Check Node.js version: `node --version` (should be v16+)

### Supabase Connection Issues

**❌ "supabaseUrl is required" or "Invalid API key"**

1. Check `.env` file exists in project root
2. Verify values are correct (no extra spaces/quotes)
3. Make sure you copied the FULL keys (very long strings)
4. Restart server after changing `.env`

**❌ "Failed to connect to Supabase"**

1. Check Supabase project is active (not paused)
2. Test in browser: Visit your `SUPABASE_URL` - should show a page
3. Verify API keys match in Supabase Settings → API

**❌ "Permission denied" or "Row level security policy violation"**

1. Confirm you ran the FULL `database/schema.sql`
2. Check for errors in SQL Editor when you ran it
3. Policies might not be set up - see Step 2.4

### Upload/Storage Issues

**❌ "Upload failed" or "Storage error"**

1. Verify bucket `fridge-images` exists
2. Check bucket is set to **Private** (not public)
3. Confirm storage policies are added (Step 2.4)
4. Try creating a new file in Storage UI to test permissions

**❌ "Access denied to storage bucket"**

- User must be signed in (authenticated)
- Bucket policies must allow user to access their own folder
- Check policies in Storage → fridge-images → Policies

### Email Notification Issues

**❌ "Email not sending"**

1. **Using Gmail?** Must use **App Password** (not regular password)
2. **2FA enabled?** Required for App Passwords
3. **Check spam folder** - first emails often go to spam
4. **Test SMTP:** Use online SMTP tester with your credentials
5. **Check server logs** for email errors

**❌ "Invalid login" or "Authentication failed"**

- Regular Gmail password won't work - must generate App Password
- App Password is 16 characters (ignore spaces)
- Make sure EMAIL_USER matches the Google account you created App Password for

### Computer Vision Issues

**❌ "CV detection not working" or stuck on "Processing..."**

1. **First time?** TensorFlow.js downloads ~10MB (takes 10-15 seconds)
2. **Use modern browser:** Chrome 90+, Firefox 88+, Edge 90+
3. **Check browser console** (F12) for errors
4. **Try smaller image:** Large images take longer
5. **WebGL support:** Visit [get.webgl.org](https://get.webgl.org) to check

**❌ "No items detected"**

- CV model only detects common food items
- Try photos with visible, recognizable items (banana, apple, bottle, etc.)
- Good lighting helps detection accuracy
- Try adding items manually if CV doesn't detect well

### Recipe API Issues

**❌ "Failed to load recipes"**

- Without API key: App uses mock recipes (this is normal)
- With API key: Check spelling of `SPOONACULAR_API_KEY` in `.env`
- Free tier limit: 150 requests/day (check usage in Spoonacular dashboard)
- Mock recipes show 2-3 generic recipes when API fails

### Port and Server Issues

**❌ "Port 3000 already in use" or "EADDRINUSE"**

```powershell
# Find what's using port 3000
netstat -ano | findstr :3000

# Option 1: Kill the process
Stop-Process -Id <PID>

# Option 2: Use different port in .env
PORT=3001
```

**❌ Server starts but can't access in browser**

- Try `http://localhost:3000` (not 127.0.0.1)
- Check firewall isn't blocking Node.js
- Try different browser

---

## 📱 What to Try Next

### Quick Wins (5 minutes)
1. ✅ **Add 3-5 food items** with realistic expiration dates
2. ✅ **Upload a fridge photo** - test CV detection
3. ✅ **Browse recipes** - see what's suggested
4. ✅ **Update settings** - configure notification preferences

### Medium Goals (15 minutes)
1. 📸 **Upload multiple photos** - build your inventory
2. 🍳 **Save favorite recipes** - click recipes you like
3. 📊 **Check dashboard** - view stats as you add items
4. ⚙️ **Customize notifications** - set your preferred warning days

### Advanced (30 minutes)
1. 📧 **Set up email notifications** - follow Step 6
2. 🔑 **Get Spoonacular API** - better recipe suggestions
3. 📱 **Test on mobile** - check responsive design
4. 👥 **Create test accounts** - simulate family members

---

## 💡 Pro Tips

### For Best CV Detection
- ✨ Use **well-lit photos** - natural light works best
- 🔍 **Individual items** detect better than cluttered fridge
- 📏 **Close-up shots** work better than wide angles
- 🍎 **Recognizable items** - bananas, apples, bottles, etc.
- ⏱️ **First load takes 10-15s** - model downloads once then caches

### For Accurate Tracking
- 📅 **Update expiration dates** when you buy groceries
- ✅ **Mark items as used** when consumed
- 📦 **Include quantities** for better tracking
- 📍 **Set storage location** (fridge/freezer/pantry)
- 📝 **Add notes** for special handling

### For Better Recipes
- 🔑 **Get Spoonacular API key** - free tier is enough
- 🗑️ **Use "Minimize Waste"** filter to prioritize expiring items
- 💾 **Save favorite recipes** for quick access
- 🔄 **Refresh recipes** regularly as inventory changes

### For Smooth Operation
- 🔄 **Check dashboard daily** - review expiring items
- 📧 **Set up emails** - automated reminders help
- 🧹 **Clean up consumed items** - keep inventory current
- 📱 **Bookmark on mobile** - quick access on phone

---

## 🎯 Success Milestones

- ✅ **Level 1:** App installed and running
- ✅ **Level 2:** Account created, dashboard accessible
- ✅ **Level 3:** 5+ items in fridge with expiration dates
- ✅ **Level 4:** CV detection working on photos
- ✅ **Level 5:** Email notifications configured
- ✅ **Level 6:** Recipe API integrated
- ✅ **Level 7:** Daily usage, tracking consumption

---

## 📚 Additional Resources

- **Full Documentation:** `README.md` - Complete feature guide
- **API Keys Guide:** `API_KEYS_GUIDE.md` - Detailed API setup
- **Deployment Guide:** `DEPLOYMENT.md` - Production hosting
- **Database Setup:** `database/SETUP.md` - Supabase details
- **Installation Fix:** `INSTALL_FIX.md` - How we fixed Windows install

---

## 🤝 Need Help?

**Common Questions:**
1. **"How do I reset my password?"** - Click "Forgot password" on sign-in page
2. **"Can multiple people use one account?"** - No, each person needs their own account
3. **"Is my data safe?"** - Yes, Supabase has enterprise-grade security + RLS policies
4. **"Does it work offline?"** - No, requires internet for database access
5. **"Can I export my data?"** - Yes, from Supabase dashboard

**Still stuck?** Check the error message in:
- Browser console (F12 → Console tab)
- Server terminal output
- Supabase logs (Supabase dashboard → Logs)

---

**You're ready to start reducing food waste! 🎉**
