# BoxBus API Setup Guide

This guide will help you configure all the necessary APIs and services for the BoxBus delivery application.

## 🔧 Required APIs & Services

### 1. **MongoDB Atlas** (Database)
- **Purpose**: Store user data, orders, and application data
- **Setup**: 
  1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
  2. Create a free cluster
  3. Get your connection string
  4. Add to `.env`: `MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/boxbus`

### 2. **Google Maps API** (Location Services)
- **Purpose**: Calculate distances, geocoding, route optimization
- **Setup**:
  1. Go to [Google Cloud Console](https://console.cloud.google.com/)
  2. Enable Maps JavaScript API, Geocoding API, Distance Matrix API
  3. Create API key
  4. Add to `.env`: `GOOGLE_MAPS_API_KEY=your-api-key`

### 3. **Twilio** (SMS Notifications)
- **Purpose**: Send SMS notifications to customers and drivers
- **Setup**:
  1. Sign up at [Twilio](https://www.twilio.com/)
  2. Get Account SID, Auth Token, and Phone Number
  3. Add to `.env`:
     ```
     TWILIO_ACCOUNT_SID=your-account-sid
     TWILIO_AUTH_TOKEN=your-auth-token
     TWILIO_PHONE_NUMBER=+1234567890
     ```

### 4. **SendGrid** (Email Notifications)
- **Purpose**: Send email notifications and receipts
- **Setup**:
  1. Sign up at [SendGrid](https://sendgrid.com/)
  2. Create API key
  3. Add to `.env`:
     ```
     SENDGRID_API_KEY=your-sendgrid-api-key
     SENDGRID_FROM_EMAIL=noreply@boxbus.com
     ```

### 5. **Firebase** (Push Notifications)
- **Purpose**: Real-time push notifications
- **Setup**:
  1. Go to [Firebase Console](https://console.firebase.google.com/)
  2. Create project and enable Cloud Messaging
  3. Download service account key
  4. Add to `.env`:
     ```
     FIREBASE_PROJECT_ID=your-project-id
     FIREBASE_PRIVATE_KEY=your-private-key
     FIREBASE_CLIENT_EMAIL=your-client-email
     ```

### 6. **WhatsApp Business API** (Optional)
- **Purpose**: WhatsApp notifications for orders
- **Setup**:
  1. Apply for [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
  2. Get access token and phone number ID
  3. Add to `.env`:
     ```
     WHATSAPP_ACCESS_TOKEN=your-access-token
     WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
     WHATSAPP_VERIFY_TOKEN=your-verify-token
     ```

### 7. **Stripe** (Payment Processing)
- **Purpose**: Handle payments for delivery fees
- **Setup**:
  1. Sign up at [Stripe](https://stripe.com/)
  2. Get API keys from dashboard
  3. Add to `.env`:
     ```
     STRIPE_SECRET_KEY=your-secret-key
     STRIPE_PUBLISHABLE_KEY=your-publishable-key
     STRIPE_WEBHOOK_SECRET=your-webhook-secret
     ```

### 8. **AWS S3** (File Storage)
- **Purpose**: Store package photos, documents
- **Setup**:
  1. Create AWS account and S3 bucket
  2. Create IAM user with S3 permissions
  3. Add to `.env`:
     ```
     AWS_ACCESS_KEY_ID=your-access-key
     AWS_SECRET_ACCESS_KEY=your-secret-key
     AWS_REGION=us-east-1
     AWS_S3_BUCKET=boxbus-uploads
     ```

## 🚀 Quick Start Setup

### Step 1: Create Environment File
```bash
cd backend
cp env.example .env
```

### Step 2: Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ..
npm install
```

### Step 3: Configure APIs
1. Copy the example environment file: `cp backend/env.example backend/.env`
2. Fill in your API keys in the `.env` file
3. Start with the essential APIs first:
   - MongoDB Atlas (required)
   - Google Maps API (for distance calculation)
   - SendGrid (for email notifications)

### Step 4: Test Your Setup
```bash
# Start backend
cd backend
npm run dev

# Start frontend (in new terminal)
npm start
```

## 🔐 Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use environment-specific keys** (development vs production)
3. **Rotate API keys** regularly
4. **Set up proper CORS** configuration
5. **Use HTTPS** in production
6. **Implement rate limiting** for API endpoints

## 📊 API Usage Monitoring

- **MongoDB Atlas**: Monitor database usage and performance
- **Google Maps**: Track API usage and costs
- **Twilio**: Monitor SMS usage and costs
- **SendGrid**: Track email delivery rates
- **Stripe**: Monitor payment processing

## 🛠️ Development vs Production

### Development
- Use free tiers where possible
- Mock external APIs for testing
- Use local databases
- Enable debug logging

### Production
- Use production API keys
- Enable all security features
- Set up monitoring and alerts
- Use production databases
- Implement proper error handling

## 📞 Support

If you need help setting up any of these APIs:
1. Check the official documentation for each service
2. Look for community tutorials and guides
3. Test each API individually before integrating
4. Start with the most critical APIs first (MongoDB, Maps, Email)

## 🎯 Priority Order

1. **MongoDB Atlas** - Essential for data storage
2. **Google Maps API** - Required for distance calculations
3. **SendGrid** - Important for user notifications
4. **Twilio** - SMS notifications
5. **Firebase** - Push notifications
6. **Stripe** - Payment processing
7. **AWS S3** - File storage
8. **WhatsApp** - Optional messaging

Start with the first 3-4 APIs to get your basic functionality working, then add the others as needed.
