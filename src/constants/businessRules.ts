import { DeliveryWindow } from '../types';

// Delivery Window Definitions
export const DELIVERY_WINDOWS: DeliveryWindow[] = [
  {
    type: 'next-day',
    label: 'Next Day Delivery',
    description: 'Standard delivery within 48 hours',
    multiplier: 1.0,
    cutoffTime: 'No cutoff - available 24/7',
    deliveryTime: 'Within 48 hours'
  },
  {
    type: 'same-day',
    label: 'Same Day Delivery',
    description: 'Delivery by 9:00 PM today (25% premium)',
    multiplier: 1.25,
    cutoffTime: '9:00 AM today',
    deliveryTime: 'By 9:00 PM today'
  },
  {
    type: 'rush',
    label: 'Rush Delivery',
    description: '2-hour delivery window (75% premium)',
    multiplier: 1.75,
    cutoffTime: '7:00 PM today',
    deliveryTime: 'Within 2 hours'
  }
];

// Business Rules
export const BUSINESS_RULES = {
  // Base pricing
  BASE_DELIVERY_FEE: 15.00,
  DISTANCE_THRESHOLD: 15, // km
  DISTANCE_RATE: 0.75, // per km after threshold
  WEIGHT_THRESHOLD: 25, // lbs
  WEIGHT_RATE: 0.25, // per lb after threshold
  WEIGHT_REDUCTION_FACTOR: 0.85, // 15% reduction per 50 lbs
  WEIGHT_MIN_RATE: 0.07, // minimum 7 cents per lb
  PACKAGE_FEE: 2.00, // per additional package
  
  // Delivery windows
  SAME_DAY_CUTOFF: '09:00', // 9:00 AM
  SAME_DAY_DELIVERY_TIME: '21:00', // 9:00 PM
  RUSH_CUTOFF: '19:00', // 7:00 PM
  
  // Taxes and fees
  GST_RATE: 0.05, // 5% GST
  INSURANCE_COVERAGE: 1000, // $1000 default coverage (built into base price)
  
  // Driver compensation
  DEFAULT_COMMISSION_RATE: 60, // 60% default
  MIN_COMMISSION_RATE: 40, // 40% minimum
  MAX_COMMISSION_RATE: 80, // 80% maximum
  
  // Order statuses
  ORDER_STATUSES: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    ASSIGNED: 'assigned',
    PICKED_UP: 'picked-up',
    IN_TRANSIT: 'in-transit',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled'
  },
  
  // User types
  USER_TYPES: {
    CUSTOMER: 'customer',
    DRIVER: 'driver',
    ADMIN: 'admin'
  },
  
  // Loyalty program
  LOYALTY_PROGRAM: {
    ORDERS_FOR_DISCOUNT: 5, // Number of orders needed for discount
    DISCOUNT_PERCENTAGE: 10, // 10% discount
    LOYALTY_TIERS: {
      BRONZE: { minOrders: 0, discount: 0, name: 'Bronze' },
      SILVER: { minOrders: 5, discount: 10, name: 'Silver' },
      GOLD: { minOrders: 15, discount: 15, name: 'Gold' }
    }
  }
};

// Time utilities
export const TIME_UTILS = {
  // Check if same-day delivery is still available
  isSameDayAvailable: (): boolean => {
    const now = new Date();
    const cutoff = new Date();
    cutoff.setHours(9, 0, 0, 0); // 9:00 AM
    return now < cutoff;
  },
  
  // Check if rush delivery is still available
  isRushAvailable: (): boolean => {
    const now = new Date();
    const cutoff = new Date();
    cutoff.setHours(19, 0, 0, 0); // 7:00 PM
    return now < cutoff;
  },
  
  // Get delivery cutoff time for a specific window
  getDeliveryCutoff: (deliveryWindow: string): Date => {
    const now = new Date();
    const cutoff = new Date();
    
    switch (deliveryWindow) {
      case 'same-day':
        cutoff.setHours(9, 0, 0, 0); // 9:00 AM today
        break;
      case 'rush':
        cutoff.setHours(19, 0, 0, 0); // 7:00 PM today
        break;
      default: // next-day
        cutoff.setHours(23, 59, 59, 999); // End of today
    }
    
    return cutoff;
  },
  
  // Format time for display
  formatTime: (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  },
  
  // Format date for display
  formatDate: (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
};

// Validation rules
export const VALIDATION_RULES = {
  // Package limits
  MAX_PACKAGE_WEIGHT: 1000, // 1000 lbs
  MAX_PACKAGE_DIMENSIONS: 120, // 120 inches (10 feet)
  MAX_PACKAGES_PER_ORDER: 20,
  
  // Distance limits
  MAX_DELIVERY_DISTANCE: 200, // 200 km
  
  // Time limits
  MAX_DELIVERY_TIME: 72, // 72 hours (3 days)
  
  // Business hours
  BUSINESS_HOURS: {
    start: '06:00', // 6:00 AM
    end: '22:00'   // 10:00 PM
  }
};
