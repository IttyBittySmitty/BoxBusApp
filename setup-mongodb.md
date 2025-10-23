# MongoDB Atlas Setup for BoxBus

## Step-by-Step MongoDB Configuration

### 1. Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Click "Try Free" or "Start Free"
3. Sign up with your email or Google account

### 2. Create a New Cluster
1. **Choose Cloud Provider**: AWS (recommended)
2. **Select Region**: Choose closest to your users (e.g., US East)
3. **Cluster Tier**: Select "M0 Sandbox" (Free tier)
4. **Cluster Name**: "BoxBus-Cluster"
5. Click "Create Cluster"

### 3. Set Up Database Access
1. **Create Database User**:
   - Username: `boxbus-admin`
   - Password: Generate a strong password (save this!)
   - Database User Privileges: "Read and write to any database"

2. **Set Up Network Access**:
   - Click "Add IP Address"
   - Choose "Allow access from anywhere" (0.0.0.0/0) for development

### 4. Get Your Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Select "Node.js" as driver
4. Copy the connection string

### 5. Update Your .env File
Replace the MongoDB URI in your `backend/.env` file:

```bash
# Replace this line in backend/.env:
MONGODB_URI=mongodb+srv://boxbus-admin:YOUR_PASSWORD@boxbus-cluster.xxxxx.mongodb.net/boxbus?retryWrites=true&w=majority
```

### 6. Test Your Connection
Run this command to test your MongoDB connection:

```bash
cd backend
npm install
npm run dev
```

You should see: "Connected to MongoDB" in the console.

## Next Steps After MongoDB Setup

1. **Google Maps API** - For distance calculations
2. **SendGrid** - For email notifications  
3. **Twilio** - For SMS notifications
4. **Firebase** - For push notifications

## Troubleshooting

- **Connection Error**: Check your IP address is whitelisted
- **Authentication Error**: Verify username and password
- **Network Error**: Ensure you're using the correct connection string

## Security Notes

- Never commit your `.env` file to version control
- Use strong passwords for database users
- In production, restrict IP addresses to your servers only
- Regularly rotate database passwords





