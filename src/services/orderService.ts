import AsyncStorage from '@react-native-async-storage/async-storage';
import { Order, Package, DeliveryQuote, OrderStatus } from '../types';
import { BUSINESS_RULES, TIME_UTILS } from '../constants/businessRules';

const API_BASE_URL = 'http://localhost:5000';
// ORDERS_KEY removed - all data now comes from backend

class OrderService {
  private static instance: OrderService;

  private constructor() {}

  public static getInstance(): OrderService {
    if (!OrderService.instance) {
      OrderService.instance = new OrderService();
    }
    return OrderService.instance;
  }

  // Local storage methods removed - all data now comes from backend


  public async createOrder(orderData: Partial<Order>): Promise<Order> {
    console.log('🔍 ORDER SERVICE RECEIVED:');
    console.log('Price data:', orderData.price);
    
    if (!orderData.customerId) {
      throw new Error('Customer ID is required to create an order');
    }

    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create order');
      }

      const newOrder = await response.json();
      console.log('✅ Order created successfully in backend');
      return newOrder;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  public async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/api/orders/my-orders`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch customer orders');
      }

      const orders = await response.json();
      console.log('📦 Retrieved customer orders from backend:', orders.length);
      return orders;
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      return [];
    }
  }

  public async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch order');
      }

      const order = await response.json();
      return order;
    } catch (error) {
      console.error('Error fetching order:', error);
      return null;
    }
  }

  public async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order | null> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update order status');
      }

      const updatedOrder = await response.json();
      console.log('📦 OrderService: Order status updated successfully in backend');
      return updatedOrder;
    } catch (error) {
      console.error('📦 OrderService: Error updating order status:', error);
      throw error;
    }
  }

  public async assignDriver(orderId: string, driverId: string): Promise<Order | null> {
    console.log('📦 OrderService: assignDriver called with orderId:', orderId, 'driverId:', driverId);
    
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ driverId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to assign driver');
      }

      const updatedOrder = await response.json();
      console.log('📦 OrderService: Driver assigned successfully in backend');
      return updatedOrder;
    } catch (error) {
      console.error('📦 OrderService: Error assigning driver:', error);
      throw error;
    }
  }

  public async updateOrder(order: Order): Promise<Order | null> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/api/orders/${order.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(order),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update order');
      }

      const updatedOrder = await response.json();
      console.log('📦 OrderService: Order updated successfully in backend');
      return updatedOrder;
    } catch (error) {
      console.error('📦 OrderService: Error updating order:', error);
      throw error;
    }
  }

  public async cancelOrder(orderId: string): Promise<Order | null> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to cancel order');
      }

      const cancelledOrder = await response.json();
      console.log('Order cancelled successfully in backend:', orderId);
      return cancelledOrder;
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  }

  public async getAvailableOrders(): Promise<Order[]> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/api/orders/available`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Available orders API error:', errorData);
        throw new Error(errorData.message || 'Failed to fetch available orders');
      }

      const orders = await response.json();
    console.log('📦 Retrieved available orders from backend:', orders.length);
    console.log('📦 Available orders details:', orders.map((o: any) => ({ id: o.id?.slice(-8), status: o.status, driver: o.driver })));
    return orders;
    } catch (error) {
      console.error('Error fetching available orders:', error);
      return [];
    }
  }

  public async getDriverOrders(): Promise<Order[]> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/api/orders/driver-orders`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Driver orders API error:', errorData);
        throw new Error(errorData.message || 'Failed to fetch driver orders');
      }

      const orders = await response.json();
      console.log('📦 Retrieved driver orders from backend:', orders.length);
      return orders;
    } catch (error) {
      console.error('Error fetching driver orders:', error);
      return [];
    }
  }

  public async getDriverCompletedOrders(): Promise<Order[]> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/api/orders/driver-completed`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Driver completed orders API error:', errorData);
        throw new Error(errorData.message || 'Failed to fetch driver completed orders');
      }

      const orders = await response.json();
      console.log('📦 Retrieved driver completed orders from backend:', orders.length);
      return orders;
    } catch (error) {
      console.error('Error fetching driver completed orders:', error);
      return [];
    }
  }

  public async getCustomerOrders(): Promise<Order[]> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/api/orders/my-orders`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Customer orders API error:', errorData);
        throw new Error(errorData.message || 'Failed to fetch customer orders');
      }

      const orders = await response.json();
      console.log('📦 Retrieved customer orders from backend:', orders.length);
      return orders;
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      return [];
    }
  }



  public async getAllOrders(): Promise<Order[]> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const orders = await response.json();
      return orders;
    } catch (error) {
      console.error('Error fetching orders from backend:', error);
      throw error;
    }
  }

  // Local storage methods removed - all data now comes from backend



  public async calculateDeliveryQuote(
    packages: Package[], 
    distance: number, 
    deliveryWindow: 'next-day' | 'same-day' | 'rush' = 'next-day',
    customerId?: string,
    duration?: string
  ): Promise<DeliveryQuote> {
    // Base pricing logic using business rules
    const basePrice = BUSINESS_RULES.BASE_DELIVERY_FEE;
    let weightFee = 0;
    let distanceFee = 0;
    let packageFee = 0;

    const totalWeight = packages.reduce((sum, pkg) => sum + pkg.weight, 0);
    const totalVolume = packages.reduce((sum, pkg) => sum + (pkg.length * pkg.width * pkg.height), 0);

    // Weight fee: $0.25 per lb over 25 lbs, with percentage-based scaling reduction
    if (totalWeight > BUSINESS_RULES.WEIGHT_THRESHOLD) {
      const excessWeight = totalWeight - BUSINESS_RULES.WEIGHT_THRESHOLD;
      
      let ratePerPound = BUSINESS_RULES.WEIGHT_RATE;
      
      if (totalWeight > 50) {
        // For every 50 pounds beyond 50, reduce by 15% (multiply by 0.85)
        const reductionFactor = Math.floor((totalWeight - 50) / 50);
        ratePerPound = BUSINESS_RULES.WEIGHT_RATE * Math.pow(BUSINESS_RULES.WEIGHT_REDUCTION_FACTOR, reductionFactor);
        ratePerPound = Math.max(BUSINESS_RULES.WEIGHT_MIN_RATE, ratePerPound);
      }
      
      weightFee = excessWeight * ratePerPound;
    }

    // Distance fee: $0.75 per km over 15km
    if (distance > BUSINESS_RULES.DISTANCE_THRESHOLD) {
      distanceFee = (distance - BUSINESS_RULES.DISTANCE_THRESHOLD) * BUSINESS_RULES.DISTANCE_RATE;
    }

    // Package fee: $2.00 per additional package beyond the first
    packageFee = (packages.length - 1) * BUSINESS_RULES.PACKAGE_FEE;

    // Calculate subtotal before delivery window multiplier (insurance cost already in base price)
    const subtotalBeforeWindow = basePrice + distanceFee + weightFee + packageFee;

    // Apply delivery window multiplier
    let deliveryWindowMultiplier = 1.0;
    switch (deliveryWindow) {
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

    // Calculate loyalty discount
    let loyaltyDiscount = 0;
    let loyaltyDiscountPercent = 0;
    let subtotalAfterDiscount = subtotal;
    
    if (customerId) {
      const loyaltyDiscountData = await this.calculateLoyaltyDiscount(customerId, subtotal);
      loyaltyDiscount = loyaltyDiscountData.discount;
      loyaltyDiscountPercent = loyaltyDiscountData.percent;
      subtotalAfterDiscount = subtotal - loyaltyDiscount;
    }

    // Calculate GST (5%) on discounted amount
    const gst = subtotalAfterDiscount * BUSINESS_RULES.GST_RATE;

    // Calculate total
    const totalPrice = subtotalAfterDiscount + gst;

    // Estimate delivery time based on delivery window
    let estimatedDeliveryTime = 'Within 48 hours';
    switch (deliveryWindow) {
      case 'same-day':
        estimatedDeliveryTime = 'By 9:00 PM today';
        break;
      case 'rush':
        estimatedDeliveryTime = 'Within 2 hours';
        break;
    }

    return {
      basePrice,
      distanceFee: Math.round(distanceFee * 100) / 100,
      weightFee: Math.round(weightFee * 100) / 100,
      packageFee: Math.round(packageFee * 100) / 100,
      deliveryWindowMultiplier,
      subtotal: Math.round(subtotal * 100) / 100,
      loyaltyDiscount: Math.round(loyaltyDiscount * 100) / 100,
      loyaltyDiscountPercent,
      subtotalAfterDiscount: Math.round(subtotalAfterDiscount * 100) / 100,
      gst: Math.round(gst * 100) / 100,
      totalPrice: Math.round(totalPrice * 100) / 100,
      estimatedDeliveryTime,
      distance,
      duration: duration || 'Calculating...',
      totalWeight,
      numberOfPackages: packages.length
    };
  }

  private async calculateLoyaltyDiscount(customerId: string, subtotal: number): Promise<{discount: number, percent: number}> {
    try {
      // Get customer's order history from backend
      const token = await AsyncStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/api/orders/customer/${customerId}/completed`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch customer order history');
      }

      const customerOrders = await response.json();
      
      const totalOrders = customerOrders.length;
      
      // Determine loyalty tier and discount
      let discountPercent = 0;
      
      if (totalOrders >= BUSINESS_RULES.LOYALTY_PROGRAM.LOYALTY_TIERS.GOLD.minOrders) {
        discountPercent = BUSINESS_RULES.LOYALTY_PROGRAM.LOYALTY_TIERS.GOLD.discount;
      } else if (totalOrders >= BUSINESS_RULES.LOYALTY_PROGRAM.LOYALTY_TIERS.SILVER.minOrders) {
        discountPercent = BUSINESS_RULES.LOYALTY_PROGRAM.LOYALTY_TIERS.SILVER.discount;
      }
      
      const discount = subtotal * (discountPercent / 100);
      
      return {
        discount: Math.round(discount * 100) / 100,
        percent: discountPercent
      };
    } catch (error) {
      console.error('Error calculating loyalty discount:', error);
      return { discount: 0, percent: 0 };
    }
  }

}

export default OrderService.getInstance();

