# BoxBus Backend API

This is the backend API for the BoxBus delivery application, built with Node.js, Express, and MongoDB.

## Features

- **User Authentication**: JWT-based authentication with bcrypt password hashing
- **User Management**: Customer, driver, and admin user types
- **Order Management**: Complete order lifecycle from creation to delivery
- **Role-based Access Control**: Different permissions for different user types
- **RESTful API**: Clean, consistent API endpoints

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Configuration:**
   - Copy `env.example` to `.env`
   - Update the following variables:
     - `MONGODB_URI`: Your MongoDB connection string
     - `JWT_SECRET`: A secure random string for JWT signing
     - `PORT`: Server port (default: 5000)

3. **Start the server:**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `GET /me` - Get current user profile
- `PUT /me` - Update current user profile

### Users (`/api/users`)
- `GET /` - Get all users (admin only)
- `GET /:id` - Get user by ID
- `PUT /:id` - Update user
- `DELETE /:id` - Delete user (admin only)
- `GET /drivers/available` - Get available drivers

### Orders (`/api/orders`)
- `POST /` - Create new order
- `GET /my-orders` - Get user's orders
- `GET /:id` - Get order by ID
- `PATCH /:id/status` - Update order status
- `PATCH /:id/assign-driver` - Assign driver to order
- `GET /available/for-drivers` - Get available orders for drivers
- `PATCH /:id/accept` - Driver accepts order

## Database Models

### User
- Email, password, name, phone, address
- User types: customer, driver, admin
- Password hashing with bcrypt

### Order
- Pickup and delivery addresses
- Package details and pricing
- Order status tracking
- Driver assignment
- Automatic tracking number generation

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- CORS configuration

## Development

The server runs on port 5000 by default. Use `npm run dev` for development with auto-restart on file changes.
