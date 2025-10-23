# BoxBusApp Deployment Guide

## 🚀 Backend Deployment to Render

### Prerequisites
- ✅ MongoDB Atlas account (already set up)
- ✅ GitHub repository with code
- ✅ Render.com account (free)

### Step 1: Prepare MongoDB Atlas
1. **Get your connection string** from MongoDB Atlas
2. **Create a database user** if you haven't already
3. **Whitelist Render's IP addresses** (0.0.0.0/0 for development)

### Step 2: Deploy to Render
1. **Go to [render.com](https://render.com)** and sign up/login
2. **Click "New +"** → **"Web Service"**
3. **Connect your GitHub repository**
4. **Configure the service:**
   - **Name**: `boxbus-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: `backend`

### Step 3: Environment Variables
Set these in Render dashboard:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/boxbus
JWT_SECRET=your-super-secret-jwt-key-here
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
NODE_ENV=production
```

**Note**: SendGrid is not configured yet. You can add email notifications later when needed.

### Step 4: Deploy
1. **Click "Create Web Service"**
2. **Wait for deployment** (usually 2-3 minutes)
3. **Test your API** at the provided URL

## 📱 Frontend Deployment with EAS

### Prerequisites
- ✅ Expo account
- ✅ EAS CLI installed: `npm install -g @expo/eas-cli`
- ✅ Google Play Console account (for Android)
- ✅ Apple Developer account (for iOS)

### Step 1: Configure EAS
```bash
# In your project root
eas login
eas build:configure
```

### Step 2: Update API URL
Update your frontend to use the production API:
```typescript
// In src/services/authService.ts and orderService.ts
const API_BASE_URL = 'https://your-render-app.onrender.com';
```

### Step 3: Build for Production
```bash
# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

### Step 4: Deploy to App Stores
```bash
# Submit to Google Play Store
eas submit --platform android

# Submit to Apple App Store
eas submit --platform ios
```

## 🔧 Production Checklist

### Backend
- [ ] MongoDB Atlas configured
- [ ] Environment variables set
- [ ] API endpoints tested
- [ ] CORS configured for production domain
- [ ] SSL certificate (automatic with Render)

### Frontend
- [ ] API URL updated to production
- [ ] App icons and splash screens configured
- [ ] App store metadata prepared
- [ ] Privacy policy and terms of service ready

### Security
- [ ] Strong JWT secret
- [ ] API keys secured
- [ ] Database access restricted
- [ ] HTTPS enabled

## 🌐 Custom Domain (Optional)

### Render Custom Domain
1. **Go to your Render service**
2. **Click "Settings"** → **"Custom Domains"**
3. **Add your domain** (e.g., `api.boxbus.com`)
4. **Update DNS records** as instructed

### Update Frontend
```typescript
const API_BASE_URL = 'https://api.boxbus.com';
```

## 📊 Monitoring

### Render Metrics
- **CPU and Memory usage**
- **Response times**
- **Error rates**

### MongoDB Atlas Monitoring
- **Database performance**
- **Connection metrics**
- **Storage usage**

## 🚨 Troubleshooting

### Common Issues
1. **Build fails**: Check Node.js version compatibility
2. **Database connection**: Verify MongoDB URI and network access
3. **Environment variables**: Ensure all required vars are set
4. **CORS errors**: Update CORS settings for production domain

### Debug Commands
```bash
# Check Render logs
# Go to Render dashboard → Your service → Logs

# Test API locally
curl https://your-app.onrender.com/api/users
```

## 📈 Scaling

### When to Upgrade
- **Free tier limits reached**
- **High traffic volume**
- **Need for better performance**

### Render Upgrade Options
- **Starter Plan**: $7/month
- **Standard Plan**: $25/month
- **Pro Plan**: $85/month

---

**🎉 Your BoxBusApp is now live in production!**
