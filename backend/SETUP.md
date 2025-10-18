# BoxBus Backend Setup Guide

## 🚀 Quick Start

### 1. Local Development Setup

#### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Git

#### Installation
```bash
cd backend
npm install
```

#### Environment Setup
Create a `.env` file in the backend directory:
```env
MONGODB_URI=mongodb://localhost:27017/boxbus
JWT_SECRET=your-super-secret-jwt-key-here
PORT=5000
NODE_ENV=development
```

#### Start Development Server
```bash
npm run dev
```

### 2. MongoDB Setup

#### Option A: Local MongoDB
1. Install MongoDB Community Server
2. Start MongoDB service
3. Create database: `use boxbus`

#### Option B: MongoDB Atlas (Recommended for Production)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create free account
3. Create new cluster
4. Get connection string
5. Update `.env` file with Atlas connection string

### 3. Render Deployment

#### Step 1: Prepare Repository
1. Push your code to GitHub
2. Ensure `render.yaml` is in the backend directory

#### Step 2: Deploy to Render
1. Go to [Render](https://render.com)
2. Connect your GitHub repository
3. Create new Web Service
4. Select the backend directory
5. Set environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Secure random string
   - `NODE_ENV`: production
   - `PORT`: 10000 (Render's default)

#### Step 3: Update Frontend
Update your React Native app to use the Render URL instead of localhost.

## 🔧 Configuration

### Environment Variables
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `PORT`: Server port (Render uses 10000)
- `NODE_ENV`: Environment (development/production)

### Database Models
- **User**: Authentication and profile data
- **Order**: Delivery orders and tracking

### API Endpoints
- Authentication: `/api/auth`
- Users: `/api/users`
- Orders: `/api/orders`

## 🧪 Testing

### Run API Tests
```bash
cd backend
node test-api.js
```

### Test with Postman/Insomnia
Import the endpoints and test the API manually.

## 📱 Frontend Integration

### Update API Base URL
In your React Native app, update the API service to point to your Render deployment:

```javascript
// For local development
const API_BASE_URL = 'http://localhost:5000/api';

// For production (Render)
const API_BASE_URL = 'https://your-app-name.onrender.com/api';
```

### Environment Configuration
Create environment-specific configurations in your React Native app.

## 🚨 Security Notes

1. **Never commit `.env` files** to version control
2. **Use strong JWT secrets** in production
3. **Enable MongoDB authentication** in production
4. **Use HTTPS** in production (Render provides this)
5. **Implement rate limiting** for production use

## 🔍 Troubleshooting

### Common Issues

#### MongoDB Connection Failed
- Check connection string format
- Verify network access (IP whitelist for Atlas)
- Check if MongoDB service is running

#### JWT Token Issues
- Verify JWT_SECRET is set
- Check token expiration
- Ensure proper Authorization header format

#### CORS Issues
- Backend is configured to allow all origins in development
- For production, restrict to your frontend domain

### Debug Mode
Set `NODE_ENV=development` to see detailed error messages.

## 📚 Next Steps

1. **Add Input Validation**: Use libraries like Joi or express-validator
2. **Implement Rate Limiting**: Use express-rate-limit
3. **Add Logging**: Use Winston or Morgan
4. **Set up Monitoring**: Add health check endpoints
5. **Database Indexing**: Optimize MongoDB queries
6. **Testing**: Add unit and integration tests

## 🆘 Support

If you encounter issues:
1. Check the console logs
2. Verify environment variables
3. Test database connectivity
4. Check Render deployment logs
