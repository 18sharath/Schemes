# Quick Start Guide

## 🚀 Fix the Backend Errors

I've fixed the errors you encountered. Here's what was wrong and how to fix it:

### 1. Rate Limiting Error (Fixed ✅)
**Problem**: Express rate limiter was complaining about X-Forwarded-For header
**Solution**: Added `app.set('trust proxy', 1)` and updated rate limiter configuration

### 2. Database Connection Error (Fixed ✅)
**Problem**: MongoDB not running on your system
**Solution**: Updated database config to handle connection errors gracefully

## 🛠️ Setup Steps

### Step 1: Install Dependencies
```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### Step 2: Start MongoDB (Choose one option)

#### Option A: Local MongoDB
```bash
# Start MongoDB service
mongod
```

#### Option B: MongoDB Atlas (Cloud - Recommended)
1. Go to https://cloud.mongodb.com
2. Create a free account
3. Create a cluster
4. Get your connection string
5. Update the MONGODB_URI in the environment

### Step 3: Start the Application

#### Development Mode (Recommended)
```bash
# Start both backend and frontend
npm run dev
```

#### Or start them separately:
```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run client
```

## 🔧 Environment Variables

The application now has default values, but you can create a `.env` file for customization:

```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/scheme_recommender
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PYTHON_PATH=python
```

## 🎯 What's Fixed

1. **Rate Limiting**: Added proper proxy trust configuration
2. **Database**: Graceful error handling for MongoDB connection
3. **Environment**: Default values so the app works out of the box
4. **Startup**: Simple startup script with environment setup

## 🚀 Test the Application

1. **Backend**: http://localhost:5000/api/health
2. **Frontend**: http://localhost:3000

## 📱 Features Available

- ✅ User Registration & Login
- ✅ Profile Management
- ✅ ML Integration (when model is available)
- ✅ Beautiful UI
- ✅ Responsive Design

## 🐛 If You Still Get Errors

1. **MongoDB Error**: The app will continue without database in development mode
2. **ML Model Error**: The app will show "service unavailable" but still work
3. **Port Error**: Make sure ports 3000 and 5000 are available

## 🎉 Success!

Once running, you'll see:
- Backend: "🚀 Server running on port 5000"
- Frontend: Opens in browser at http://localhost:3000

The application is now ready to use! 🎊
