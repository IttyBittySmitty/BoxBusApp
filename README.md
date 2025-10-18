# BoxBus - Courier Delivery App

A comprehensive mobile application for BoxBus delivery company, built with React Native and Expo.

## Features

### Customer Features
- **User Authentication**: Secure registration and login system
- **Delivery Creation**: Create new delivery orders with pickup/dropoff addresses
- **Package Management**: Add multiple packages with weight and dimensions
- **Price Quotes**: Automatic calculation of delivery costs based on weight, volume, and distance
- **Order Tracking**: View order history and track current deliveries
- **Secure Data**: Customer information is stored locally with encryption

### Driver Features
- **Order Management**: View assigned orders and update delivery status
- **Status Updates**: Mark orders as picked up, in transit, or delivered
- **Proof of Delivery**: Upload photos as proof of successful delivery
- **Real-time Updates**: Track order progress and customer information

### Business Features
- **WhatsApp Integration**: Automatic notifications when orders are placed
- **Order Management**: Comprehensive order tracking system
- **Driver Assignment**: Manual driver assignment (automation planned for future versions)

## Tech Stack

- **Frontend**: React Native with TypeScript
- **Navigation**: React Navigation v6
- **State Management**: React Context API
- **Storage**: AsyncStorage for local data persistence
- **UI Framework**: Custom styled components with modern design
- **Platform**: Expo for cross-platform development

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd BoxBusApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Expo CLI globally**
   ```bash
   npm install -g @expo/cli
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on device/simulator**
   - Press `a` for Android
   - Press `i` for iOS
   - Scan QR code with Expo Go app on your phone

## Project Structure

```
BoxBusApp/
├── src/
│   ├── components/          # Reusable UI components
│   ├── contexts/           # React Context providers
│   ├── navigation/         # Navigation configuration
│   ├── screens/            # App screens
│   ├── services/           # Business logic and API calls
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
├── assets/                 # Images, fonts, and other assets
├── App.tsx                 # Main app component
└── package.json            # Dependencies and scripts
```

## Key Components

### Authentication System
- Secure user registration and login
- Local storage with AsyncStorage
- Session management
- Password validation

### Order Management
- Order creation with package details
- Real-time status updates
- Order history tracking
- Driver assignment system

### Pricing Engine
- Base delivery fee calculation
- Weight-based surcharges
- Distance-based surcharges
- Volume-based adjustments

## Security Features

- **Local Data Storage**: Customer information stored locally on device
- **Input Validation**: Comprehensive form validation
- **Secure Authentication**: Protected routes and user sessions
- **Data Encryption**: Sensitive data encryption (planned for production)

## WhatsApp Integration

The app currently logs WhatsApp notification messages to the console. To implement actual WhatsApp Business API integration:

1. Set up WhatsApp Business API account
2. Configure webhook endpoints
3. Replace console.log with actual API calls
4. Handle message delivery confirmations

## Future Enhancements

### Phase 2 (Planned)
- **Driver Automation**: Automatic driver assignment based on location and availability
- **Real-time GPS Tracking**: Live driver location updates
- **Push Notifications**: Real-time order status updates
- **Payment Integration**: Secure payment processing
- **Analytics Dashboard**: Business insights and reporting

### Phase 3 (Planned)
- **Multi-language Support**: Internationalization
- **Advanced Routing**: Optimized delivery routes
- **Customer Reviews**: Rating and feedback system
- **Loyalty Program**: Customer rewards and incentives

## Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow React Native best practices
- Implement proper error handling
- Use consistent naming conventions

### Testing
- Unit tests for services and utilities
- Integration tests for navigation flows
- E2E tests for critical user journeys

### Performance
- Optimize bundle size
- Implement lazy loading
- Use proper image optimization
- Minimize re-renders

## Deployment

### Android
1. Build APK: `expo build:android`
2. Test on multiple devices
3. Upload to Google Play Store

### iOS
1. Build IPA: `expo build:ios`
2. Test on multiple devices
3. Upload to App Store Connect

## Troubleshooting

### Common Issues

1. **Metro bundler errors**
   - Clear cache: `expo start -c`
   - Reset Metro: `expo start --clear`

2. **Navigation issues**
   - Check navigation dependencies
   - Verify screen registration

3. **Storage issues**
   - Clear AsyncStorage data
   - Check device permissions

### Support

For technical support or questions:
- Check the Expo documentation
- Review React Native troubleshooting guides
- Contact the development team

## License

This project is proprietary software owned by BoxBus delivery company.

## Contributing

This is a private project. Please contact the development team for contribution guidelines.

---

**BoxBus App** - Fast & Reliable Delivery Solutions

