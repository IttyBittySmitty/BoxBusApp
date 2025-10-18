export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name?: string; // For compatibility
  phone: string;
  address: string;
  userType?: 'customer' | 'driver' | 'admin';
  loyaltyPoints?: number;
  totalOrders?: number;
  loyaltyTier?: 'bronze' | 'silver' | 'gold';
  createdAt: Date;
  updatedAt: Date;
}

export interface Package {
  id: string;
  weight: number; // in lbs
  length: number; // in inches
  width: number; // in inches
  height: number; // in inches
  description?: string;
  fragile?: boolean;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Order {
  id: string;
  customerId: string;
  driverId?: string;
  pickupAddress: string;
  dropoffAddress: string;
  packages: Package[];
  totalWeight: number;
  totalVolume: number;
  distance: number;
  deliveryWindow: 'next-day' | 'same-day' | 'rush';
  deliveryCutoff: Date;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  status: OrderStatus;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  
  // Detailed pricing breakdown
  price: {
    basePrice: number;
    distanceFee: number;
    weightFee: number;
    packageFee: number;
    deliveryWindowMultiplier: number;
    subtotal: number;
    gst: number;
    total: number;
  };
  
  // Driver compensation
  driverCompensation: {
    commissionRate: number;
    commissionAmount: number;
    tips: number;
    totalEarnings: number;
  };
  
  // Insurance (built into pricing)
  insurance: {
    isInsured: boolean;
    coverageAmount: number;
  };
  
  paymentStatus: 'pending' | 'paid' | 'failed';
  trackingNumber: string;
  specialInstructions?: string;
  customerNotes?: string;
  driverNotes?: string;
  notes?: string;
  pickupTime?: Date;
  deliveryTime?: Date;
  proofOfDelivery?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  ASSIGNED = 'assigned',
  PICKED_UP = 'picked-up',
  IN_TRANSIT = 'in-transit',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicleInfo: string;
  isAvailable: boolean;
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface DeliveryWindow {
  type: 'next-day' | 'same-day' | 'rush';
  label: string;
  description: string;
  multiplier: number;
  cutoffTime: string;
  deliveryTime: string;
}

export interface DeliveryQuote {
  basePrice: number;
  distanceFee: number;
  weightFee: number;
  packageFee: number;
  deliveryWindowMultiplier: number;
  subtotal: number;
  loyaltyDiscount?: number;
  loyaltyDiscountPercent?: number;
  subtotalAfterDiscount: number;
  gst: number;
  totalPrice: number;
  estimatedDeliveryTime: string;
  distance: number;
  totalWeight: number;
  numberOfPackages: number;
}

