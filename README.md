# 🍎 Smart Fridge Manager

A professional AI-powered fridge management application that helps you track food items, get expiration notifications, and minimize food waste with intelligent recipe suggestions.

## ✨ Features

- **🤖 AI Image Recognition**: Upload photos of your fridge and automatically detect ingredients using computer vision (TensorFlow.js/COCO-SSD)
- **📅 Expiration Tracking**: Automatic tracking of food expiration dates with shelf-life estimates
- **📧 Email Notifications**: Get notified before food expires (customizable notification period)
- **🍳 Smart Recipe Suggestions**: Get recipe ideas that use your available ingredients, prioritizing items expiring soon
- **🔐 Secure Authentication**: User authentication and authorization with Supabase Auth
- **☁️ Cloud Storage**: Store fridge photos securely in Supabase Storage buckets
- **📊 Dashboard Analytics**: Track consumption patterns and food waste statistics
- **📱 Responsive Design**: Professional UI that works on desktop and mobile devices

## 🛠️ Tech Stack

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- TensorFlow.js with COCO-SSD model for object detection
- Responsive design with modern CSS Grid and Flexbox

### Backend
- Node.js with Express
- Supabase (PostgreSQL database, authentication, storage)
- Node-cron for scheduled tasks
- Nodemailer for email notifications

### APIs
- Spoonacular API (recipe suggestions)
- Open Food Facts API (nutritional info and shelf life)
- Edamam API (alternative recipe source)

## 📋 Prerequisites

- Node.js (v16 or higher)
- Supabase account
- Email account for notifications (Gmail recommended)
- API keys (optional but recommended):
  - Spoonacular API key
  - Edamam API credentials (optional)

## 🚀 Setup Instructions

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `database/schema.sql`
3. Set up Storage bucket:
   - Go to Storage → Create bucket named `fridge-images`
   - Set as Private
   - Add policies from `database/SETUP.md`
4. Get your credentials from Settings → API

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# API Keys
SPOONACULAR_API_KEY=your_spoonacular_api_key
FOOD_DATA_API_KEY=your_food_data_api_key

# Server Configuration
PORT=3000
APP_URL=http://localhost:3000
```

#### Gmail Setup for Notifications

1. Enable 2-factor authentication on your Google account
2. Generate an App Password:
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Create a new app password for "Mail"
   - Use this password in `EMAIL_PASSWORD`

#### Get API Keys

1. **Spoonacular** (recommended): 
   - Sign up at [spoonacular.com/food-api](https://spoonacular.com/food-api)
   - Free tier: 150 requests/day
   
2. **Edamam** (optional backup):
   - Sign up at [developer.edamam.com](https://developer.edamam.com/)

### 4. Run the Application

```bash
npm start
```

The app will be available at `http://localhost:3000`

## 📁 Project Structure

```
smart-fridge-manager/
├── config/
│   └── supabase.js          # Supabase client configuration
├── database/
│   ├── schema.sql           # Database schema
│   └── SETUP.md            # Supabase setup guide
├── services/
│   ├── authService.js       # Authentication logic
│   ├── storageService.js    # Image upload/storage
│   ├── cvService.js         # Computer vision detection
│   ├── fridgeService.js     # Fridge item management
│   ├── notificationService.js # Email notifications
│   └── recipeService.js     # Recipe suggestions
├── js/
│   ├── signin.js           # Sign in page logic
│   ├── signup.js           # Sign up page logic
│   ├── dashboard.js        # Dashboard functionality
│   ├── fridge.js           # Fridge management
│   ├── recipes.js          # Recipe browsing
│   └── settings.js         # User settings
├── index.html              # Landing page
├── signin.html             # Sign in page
├── signup.html             # Sign up page
├── dashboard.html          # Main dashboard
├── fridge.html             # Fridge inventory
├── recipes.html            # Recipe suggestions
├── settings.html           # User settings
├── styles.css              # Application styles
├── server.js               # Express server
├── package.json            # Dependencies
└── .env                    # Environment variables (create this)
```

## 🎯 Usage Guide

### Getting Started

1. **Sign Up**: Create an account with email and password
2. **Upload Photo**: Click "Upload Fridge Photo" and select an image
3. **Review Detections**: The AI will detect food items automatically
4. **Confirm Items**: Edit detected items and add expiration dates
5. **Get Recipes**: View recipe suggestions based on your ingredients
6. **Track Expiration**: Get email alerts before food expires

### Managing Your Fridge

- **Add Items Manually**: Click "Add Manually" to input items without photos
- **Edit Items**: Click any item to update quantity, expiration date, or notes
- **Mark as Used**: When you consume an item, mark it as used to track consumption
- **Filter & Search**: Use filters to find specific items quickly

### Recipe Suggestions

- **All Recipes**: Browse all available recipes with your ingredients
- **Minimize Waste**: See recipes that use items expiring soon
- **Saved Recipes**: Access your saved favorite recipes

### Settings

- **Profile**: Update your name and profile information
- **Notifications**: Enable/disable email alerts and set notification timing
- **Password**: Change your password securely
- **Delete Account**: Permanently delete your account and data

## 🔧 Troubleshooting

### Images Not Uploading
- Check Supabase storage bucket is created and policies are set
- Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct

### CV Detection Not Working
- TensorFlow.js requires a modern browser (Chrome, Firefox, Edge recommended)
- Large images may take longer to process

### Email Notifications Not Sending
- Verify email credentials in `.env`
- For Gmail, ensure you're using an App Password, not your regular password
- Check spam folder for test emails

### Recipe API Errors
- Free tier API keys have rate limits
- Check API key is valid and not expired
- App will fall back to mock recipes if API fails

## 🔐 Security Features

- Row Level Security (RLS) policies in Supabase
- Secure password hashing
- Session-based authentication
- Private storage buckets with user-specific access
- Environment variables for sensitive data

## 📈 Future Enhancements

- [ ] Barcode scanning for quick item entry
- [ ] Shopping list generation
- [ ] Integration with grocery delivery services
- [ ] Meal planning calendar
- [ ] Family/household sharing
- [ ] Mobile app (React Native)
- [ ] Voice assistant integration
- [ ] Nutrition tracking

## 🤝 Contributing

This is a personal project, but suggestions and feedback are welcome!

## 📄 License

MIT License - feel free to use and modify for your own projects.

## 🙏 Acknowledgments

- TensorFlow.js and COCO-SSD for object detection
- Supabase for backend infrastructure
- Spoonacular for recipe API
- Open Food Facts for food data

## 📧 Support

For issues or questions, please check the troubleshooting section or refer to the documentation in the `database/` folder.

---

Made with ❤️ to help reduce food waste