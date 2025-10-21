# BoxBus - Courier Delivery App

A comprehensive mobile application for BoxBus delivery company, built with React Native, Expo, and a Node.js backend. This app provides a complete delivery management system for customers, drivers, and administrators.

## 🚀 Current Features

### Customer Features
- **User Authentication**: Secure registration and login with JWT tokens
- **Delivery Creation**: Create new delivery orders with real-time distance calculation
- **Package Management**: Add multiple packages with weight, dimensions, and special handling
- **Dynamic Pricing**: Automatic calculation based on weight, distance, and delivery windows
- **Order Tracking**: Real-time status updates and order history
- **Loyalty Program**: Tiered discounts based on order history (Bronze, Silver, Gold)

### Driver Features
- **Order Management**: View and accept available orders
- **Status Updates**: Mark orders as picked up, in transit, or delivered
- **Dashboard**: Comprehensive driver dashboard with order management
- **Order History**: View completed and cancelled orders

### Admin Features
- **User Management**: Approve drivers, archive users, manage all accounts
- **Order Analytics**: View completed orders, revenue tracking, user statistics
- **Driver Approval**: Review and approve driver applications
- **Archive System**: Archive problematic users with restore functionality

## 🏗️ Technical Architecture

### Frontend
- **React Native** with Expo** for cross-platform mobile development
- **TypeScript** for type safety and better development experience
- **React Navigation** with role-based drawer navigation
- **Context API** for state management
- **AsyncStorage** for token persistence

### Backend
- **Node.js/Express** server with RESTful API
- **MongoDB** with Mongoose for data persistence
- **JWT Authentication** with bcrypt password hashing
- **Real-time distance calculation** using Google Maps API
- **Role-based access control** (Customer, Driver, Admin)

### Key Services
- **Authentication Service**: User registration, login, profile management
- **Order Service**: Order creation, status updates, tracking
- **Distance Service**: Real-time distance and duration calculation
- **Notification Service**: WhatsApp integration for order notifications

## 📱 User Roles & Navigation

### Customer Flow
1. **Register/Login** → Create delivery → Track orders → View history
2. **Screens**: New Delivery, My Orders, Completed Orders, Profile

### Driver Flow
1. **Register/Login** → Wait for approval → Accept orders → Update status → Complete delivery
2. **Screens**: Driver Dashboard, My Orders, Completed Orders, Profile

### Admin Flow
1. **Login** → Manage users → Approve drivers → View analytics → Archive users
2. **Screens**: Admin Dashboard, Archived Users, Completed Orders, Profile

## 💰 Pricing Engine

The app features a sophisticated pricing algorithm:

### Base Pricing
- **Base Fee**: $15.00 per delivery (includes insurance)
- **Distance Fee**: $0.75 per km after 15km
- **Weight Fee**: $0.25 per lb after 25lbs (with scaling reductions)
- **Package Fee**: $2.00 per additional package
- **GST**: 5% on all orders

### Delivery Windows
- **Next Day**: Standard delivery (1.0x multiplier)
- **Same Day**: 25% premium (1.25x multiplier)
- **Rush**: 75% premium (1.75x multiplier)

### Loyalty Program
- **Bronze**: 0% discount (0+ orders)
- **Silver**: 10% discount (5+ orders)
- **Gold**: 15% discount (15+ orders)

## 🔄 Order Status Flow

```
PENDING → ASSIGNED → PICKED_UP → IN_TRANSIT → DELIVERED
```

- **PENDING**: Order created, waiting for driver
- **ASSIGNED**: Driver accepted the order
- **PICKED_UP**: Driver picked up the package
- **IN_TRANSIT**: Package being delivered
- **DELIVERED**: Successfully delivered
- **CANCELLED**: Order cancelled (before pickup only)

## 🛠️ Development Challenges & Solutions

### Challenge 1: OpenRoute API Integration
**Problem**: Initially integrated with OpenRoute API for distance calculation, but encountered several issues:
- Complex API structure with nested response objects
- Inconsistent response formats
- Rate limiting and reliability issues
- Difficult error handling

**Solution**: Switched to Google Maps Distance Matrix API for:
- Simpler, more reliable responses
- Better error handling
- More consistent data format
- Better documentation and support

### Challenge 2: Data Migration from AsyncStorage to Backend
**Problem**: Originally built with local storage (AsyncStorage) for data persistence, but this approach had limitations:
- Data not shared between devices
- No real-time updates
- Limited scalability
- Security concerns with local data

**Solution**: Complete migration to backend storage:
- **Database**: MongoDB with Mongoose for data modeling
- **API**: RESTful endpoints for all operations
- **Authentication**: JWT-based authentication system
- **Real-time**: Backend handles all data operations
- **Security**: Server-side validation and authorization

**Migration Impact**:
- Rebuilt all data services to use API calls instead of local storage
- Updated all screens to handle async data loading
- Implemented proper error handling for network requests
- Added loading states and refresh functionality
- Ensured data consistency across all user types

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env  # Configure your environment variables
npm run dev  # Start with nodemon for development
```

### Frontend Setup
```bash
npm install
npm start  # Start Expo development server
```

### Environment Variables
Create a `.env` file in the backend directory by copying the example:
```bash
cp backend/env.example backend/.env
```

Then edit `backend/.env` with your actual values:
```
MONGODB_URI=mongodb://localhost:27017/boxbus
JWT_SECRET=your-super-secret-jwt-key-here
GOOGLE_MAPS_API_KEY=your-google-maps-api-key-here
SENDGRID_API_KEY=your-sendgrid-api-key-here
PORT=5000
NODE_ENV=development
```

**⚠️ Important**: Never commit your `.env` file to version control. It contains sensitive API keys.

## 📁 Project Structure

```
BoxBusApp/
├── backend/
│   ├── models/          # MongoDB schemas (User, Order)
│   ├── routes/          # API endpoints (users, orders, distance)
│   ├── middleware/       # Authentication middleware
│   ├── services/        # Business logic (distance calculation)
│   └── server.js        # Express server setup
├── src/
│   ├── components/      # Reusable UI components
│   ├── contexts/        # React Context providers
│   ├── navigation/      # Navigation configuration
│   ├── screens/         # App screens
│   ├── services/        # API services
│   ├── types/           # TypeScript definitions
│   └── utils/           # Utility functions
└── assets/              # Images and static assets
```

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Role-based Access**: Different permissions for customers, drivers, and admins
- **Input Validation**: Server-side validation for all user inputs
- **Archive System**: Ability to archive problematic users
- **Login Prevention**: Archived users cannot log in

## 🚀 Deployment

### Backend Deployment
- Deploy to cloud platforms (Heroku, Railway, AWS)
- Configure MongoDB Atlas for production database
- Set up environment variables
- Enable HTTPS for secure API communication

### Mobile App Deployment
- **Android**: Build APK with `expo build:android`
- **iOS**: Build IPA with `expo build:ios`
- **App Stores**: Submit to Google Play Store and Apple App Store

## 🔮 Future Enhancements

### Phase 2 (Planned)
- **Real-time GPS Tracking**: Live driver location updates
- **Push Notifications**: Real-time order status updates
- **Payment Integration**: Secure payment processing
- **Advanced Analytics**: Business insights and reporting
- **Driver Automation**: Automatic driver assignment

### Phase 3 (Planned)
- **Multi-language Support**: Internationalization
- **Advanced Routing**: Optimized delivery routes
- **Customer Reviews**: Rating and feedback system
- **API Rate Limiting**: Enhanced API security
- **Caching**: Redis for improved performance

## 🐛 Troubleshooting

### Common Issues

1. **Metro bundler errors**
   - Clear cache: `expo start -c`
   - Reset Metro: `expo start --clear`

2. **Backend connection issues**
   - Check MongoDB connection
   - Verify environment variables
   - Check API endpoints

3. **Authentication issues**
   - Clear AsyncStorage: `AsyncStorage.clear()`
   - Check JWT token expiration
   - Verify user permissions

## 📊 Current Status

- ✅ **Authentication System**: Complete with role-based access
- ✅ **Order Management**: Full lifecycle from creation to delivery
- ✅ **User Management**: Admin controls with archive/restore functionality
- ✅ **Pricing Engine**: Sophisticated algorithm with loyalty program
- ✅ **Distance Calculation**: Google Maps API integration
- ✅ **Data Migration**: Successfully moved from AsyncStorage to backend
- ✅ **Archive System**: Users can be archived and prevented from logging in

## 🤝 Contributing

This is a private project for BoxBus delivery company. For development questions or contributions, contact the development team.

## 📄 License

This project is proprietary software owned by BoxBus delivery company.

---

**BoxBus App** - Fast & Reliable Delivery Solutions

*Built with ❤️ using React Native, Node.js, and MongoDB*