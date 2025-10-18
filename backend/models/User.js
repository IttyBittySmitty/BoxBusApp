const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  userType: {
    type: String,
    enum: ['customer', 'driver', 'admin'],
    default: 'customer'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  profileImage: String,
  
  // Driver-specific fields
  driverInfo: {
    vehicleMake: String,
    vehicleModel: String,
    vehicleYear: Number,
    cargoCapacity: Number, // in cubic feet
    licensePlate: String,
    driverLicense: String, // license number
    insuranceProof: String, // insurance policy number
    commissionRate: {
      type: Number,
      default: 60, // 60% by default
      min: 40,
      max: 80
    },
    isAvailable: {
      type: Boolean,
      default: false
    },
    availability: [{
      day: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      },
      startTime: String, // Format: "09:00"
      endTime: String,   // Format: "17:00"
      isAvailable: {
        type: Boolean,
        default: true
      }
    }],
    currentLocation: {
      latitude: Number,
      longitude: Number,
      lastUpdated: Date
    }
  },
  
  // Business customer fields
  businessInfo: {
    businessName: String,
    businessType: String,
    taxId: String,
    isBusinessCustomer: {
      type: Boolean,
      default: false
    }
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to get user without password
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
