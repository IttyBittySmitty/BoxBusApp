const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/boxbus', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createAdmin() {
  try {
    console.log('Creating admin account...');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'Smitty@boxbus.ca' });
    if (existingAdmin) {
      console.log('Admin account already exists!');
      process.exit(0);
    }

    // Create admin user
    const adminUser = new User({
      email: 'Smitty@boxbus.ca',
      password: '123456',
      firstName: 'Smitty',
      lastName: 'Admin',
      phone: '+1 (555) 000-0000',
      address: 'BoxBus Headquarters, Vancouver, BC',
      userType: 'admin',
      isApproved: true,
      loyaltyPoints: 0,
      totalOrders: 0,
      loyaltyTier: 'bronze',
    });

    await adminUser.save();
    console.log('Admin account created successfully!');
    console.log('Email: Smitty@boxbus.ca');
    console.log('Password: 123456');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();
