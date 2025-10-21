const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  pickupAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  deliveryAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  packageDetails: {
    weight: { type: Number, required: true },
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    description: String,
    fragile: { type: Boolean, default: false },
    numberOfPackages: { type: Number, required: true, default: 1 },
    photos: [String] // Array of photo URLs
  },
  distance: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Delivery window and timing
  deliveryWindow: {
    type: String,
    enum: ['next-day', 'same-day', 'rush'],
    required: true,
    default: 'next-day'
  },
  deliveryCutoff: {
    type: Date,
    required: true
  },
  estimatedDelivery: Date,
  actualDelivery: Date,
  
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  
  // Pricing breakdown
  price: {
    basePrice: { type: Number, required: true },
    distanceFee: { type: Number, default: 0 },
    weightFee: { type: Number, default: 0 },
    packageFee: { type: Number, default: 0 },
    deliveryWindowMultiplier: { type: Number, default: 1.0 },
    subtotal: { type: Number, required: true },
    gst: { type: Number, required: true }, // 5% GST
    total: { type: Number, required: true }
  },
  
  
  // Insurance (built into pricing, no separate fee)
  insurance: {
    isInsured: { type: Boolean, default: true },
    coverageAmount: { type: Number, default: 1000 } // $1000 default coverage
  },
  
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  trackingNumber: {
    type: String,
    unique: true,
    required: false
  },
  
  // Special instructions and notes
  specialInstructions: String,
  customerNotes: String,
  
  // Order status
  status: {
    type: String,
    enum: ['PENDING', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'],
    default: 'PENDING'
  },
  
  // Timestamps
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
orderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Generate tracking number
orderSchema.pre('save', function(next) {
  if (this.isNew) {
    this.trackingNumber = 'BB' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase();
  }
  next();
});

// Calculate pricing based on the BoxBus algorithm with delivery windows and GST
orderSchema.methods.calculatePrice = function() {
  // Base price: $15 per job (pickup + delivery) - insurance already included
  const basePrice = 15.00;
  
  // Distance fee: $0.75 per km after 15km
  let distanceFee = 0;
  if (this.distance > 15) {
    distanceFee = (this.distance - 15) * 0.75;
  }
  
  // Weight fee: $0.25 per pound after 25 pounds, with percentage-based scaling reduction
  let weightFee = 0;
  if (this.packageDetails.weight > 25) {
    const excessWeight = this.packageDetails.weight - 25;
    
    // Calculate the rate based on percentage reductions for each 50-pound increment
    let ratePerPound = 0.25;
    
    if (this.packageDetails.weight > 50) {
      // For every 50 pounds beyond 50, reduce by 15% (multiply by 0.85)
      const reductionFactor = Math.floor((this.packageDetails.weight - 50) / 50);
      ratePerPound = 0.25 * Math.pow(0.85, reductionFactor);
      ratePerPound = Math.max(0.07, ratePerPound);
    }
    
    weightFee = excessWeight * ratePerPound;
  }
  
  // Package fee: $2.00 per additional package beyond the first
  const packageFee = (this.packageDetails.numberOfPackages - 1) * 2.00;
  
  // Calculate subtotal before delivery window multiplier (insurance cost already in base price)
  const subtotalBeforeWindow = basePrice + distanceFee + weightFee + packageFee;
  
  // Apply delivery window multiplier
  let deliveryWindowMultiplier = 1.0;
  switch (this.deliveryWindow) {
    case 'same-day':
      deliveryWindowMultiplier = 1.25; // 25% more
      break;
    case 'rush':
      deliveryWindowMultiplier = 1.75; // 75% more
      break;
    default: // next-day
      deliveryWindowMultiplier = 1.0;
  }
  
  // Calculate final subtotal
  const subtotal = subtotalBeforeWindow * deliveryWindowMultiplier;
  
  // Calculate GST (5%)
  const gst = subtotal * 0.05;
  
  // Calculate total
  const total = subtotal + gst;
  
  
  // Update the price object
  this.price = {
    basePrice,
    distanceFee: Math.round(distanceFee * 100) / 100,
    weightFee: Math.round(weightFee * 100) / 100,
    packageFee: Math.round(packageFee * 100) / 100,
    deliveryWindowMultiplier,
    subtotal: Math.round(subtotal * 100) / 100,
    gst: Math.round(gst * 100) / 100,
    total: Math.round(total * 100) / 100
  };
  
  
  return this.price;
};

module.exports = mongoose.model('Order', orderSchema);
