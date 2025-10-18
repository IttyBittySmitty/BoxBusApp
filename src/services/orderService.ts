import AsyncStorage from '@react-native-async-storage/async-storage';
import { Order, Package, DeliveryQuote, OrderStatus } from '../types';
import { BUSINESS_RULES, TIME_UTILS } from '../constants/businessRules';

const ORDERS_KEY = 'boxbus_orders';

class OrderService {
  private static instance: OrderService;

  private constructor() {}

  public static getInstance(): OrderService {
    if (!OrderService.instance) {
      OrderService.instance = new OrderService();
    }
    return OrderService.instance;
  }

  private async getOrders(): Promise<Order[]> {
    try {
      const ordersJson = await AsyncStorage.getItem(ORDERS_KEY);
      return ordersJson ? JSON.parse(ordersJson) : [];
    } catch (error) {
      console.error('Error getting orders:', error);
      return [];
    }
  }

  private async saveOrders(orders: Order[]): Promise<void> {
    try {
      await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    } catch (error) {
      console.error('Error saving orders:', error);
    }
  }

  public async createDemoOrders(): Promise<void> {
    const demoOrders: Order[] = [
      {
        id: 'order1',
        customerId: 'demo-customer-1',
        pickupAddress: '123 Main St, Downtown, DC 20001',
        dropoffAddress: '456 Oak Ave, Suburbia, DC 20002',
        packages: [
          {
            id: 'pkg1',
            weight: 25,
            length: 20,
            width: 15,
            height: 10,
            description: 'Small package',
            fragile: false,
          }
        ],
        totalWeight: 25,
        totalVolume: 3000,
        distance: 25,
        deliveryWindow: 'next-day',
        deliveryCutoff: TIME_UTILS.getDeliveryCutoff('next-day'),
        status: OrderStatus.PENDING,
        priority: 'normal',
        price: {
          basePrice: 15.00,
          distanceFee: 7.50,
          weightFee: 0,
          packageFee: 0,
          deliveryWindowMultiplier: 1.0,
          subtotal: 22.50,
          gst: 1.13,
          total: 23.63
        },
        driverCompensation: {
          commissionRate: 60,
          commissionAmount: 13.50,
          tips: 0,
          totalEarnings: 13.50
        },
        insurance: {
          isInsured: true,
          coverageAmount: 1000
        },
        paymentStatus: 'pending',
        trackingNumber: 'BB12345678',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'order2',
        customerId: 'demo-customer-2',
        pickupAddress: '789 Business Blvd, Industrial Park, DC 20003',
        dropoffAddress: '321 Commerce St, Retail District, DC 20004',
        packages: [
          {
            id: 'pkg2',
            weight: 50,
            length: 30,
            width: 25,
            height: 20,
            description: 'Medium package',
            fragile: true,
          }
        ],
        totalWeight: 50,
        totalVolume: 15000,
        distance: 50,
        deliveryWindow: 'same-day',
        deliveryCutoff: TIME_UTILS.getDeliveryCutoff('same-day'),
        status: OrderStatus.PENDING,
        priority: 'normal',
        price: {
          basePrice: 15.00,
          distanceFee: 26.25,
          weightFee: 6.25,
          packageFee: 0,
          deliveryWindowMultiplier: 1.25,
          subtotal: 59.38,
          gst: 2.97,
          total: 62.35
        },
        driverCompensation: {
          commissionRate: 60,
          commissionAmount: 35.63,
          tips: 0,
          totalEarnings: 35.63
        },
        insurance: {
          isInsured: true,
          coverageAmount: 1000
        },
        paymentStatus: 'pending',
        trackingNumber: 'BB87654321',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await this.saveOrders(demoOrders);
  }

  public async createOrder(orderData: Partial<Order>): Promise<Order> {
    const orders = await this.getOrders();
    const newOrder: Order = {
      id: `order${Date.now()}`,
      customerId: orderData.customerId || 'demo-customer',
      pickupAddress: orderData.pickupAddress || '',
      dropoffAddress: orderData.dropoffAddress || '',
      packages: orderData.packages || [],
      totalWeight: orderData.totalWeight || 0,
      totalVolume: orderData.totalVolume || 0,
      distance: orderData.distance || 0,
      deliveryWindow: orderData.deliveryWindow || 'next-day',
      deliveryCutoff: orderData.deliveryCutoff || TIME_UTILS.getDeliveryCutoff('next-day'),
      status: OrderStatus.PENDING,
      priority: 'normal',
      price: {
        basePrice: 15.00,
        distanceFee: 0,
        weightFee: 0,
        packageFee: 0,
        deliveryWindowMultiplier: 1.0,
        subtotal: 15.00,
        gst: 0.75,
        total: 15.75
      },
      driverCompensation: {
        commissionRate: 60,
        commissionAmount: 9.00,
        tips: 0,
        totalEarnings: 9.00
      },
      insurance: {
        isInsured: true,
        coverageAmount: 1000
      },
      paymentStatus: 'pending',
      trackingNumber: `BB${Date.now().toString().slice(-8)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    orders.push(newOrder);
    await this.saveOrders(orders);
    return newOrder;
  }

  public async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    const orders = await this.getOrders();
    return orders.filter(order => order.customerId === customerId);
  }

  public async getOrderById(orderId: string): Promise<Order | null> {
    const orders = await this.getOrders();
    return orders.find(order => order.id === orderId) || null;
  }

  public async updateOrderStatus(orderId: string, status: OrderStatus, driverId?: string): Promise<Order | null> {
    const orders = await this.getOrders();
    const orderIndex = orders.findIndex(order => order.id === orderId);
    
    if (orderIndex === -1) return null;
    
    orders[orderIndex].status = status;
    orders[orderIndex].updatedAt = new Date();
    
    // Update timing fields based on status
    if (status === OrderStatus.PICKED_UP) {
      orders[orderIndex].pickupTime = new Date();
    } else if (status === OrderStatus.DELIVERED) {
      orders[orderIndex].deliveryTime = new Date();
    }
    
    await this.saveOrders(orders);
    return orders[orderIndex];
  }

  public async assignDriver(orderId: string, driverId: string): Promise<Order | null> {
    const orders = await this.getOrders();
    const orderIndex = orders.findIndex(order => order.id === orderId);
    
    if (orderIndex === -1) return null;
    
    orders[orderIndex].driverId = driverId;
    orders[orderIndex].status = OrderStatus.ASSIGNED;
    orders[orderIndex].updatedAt = new Date();
    
    await this.saveOrders(orders);
    return orders[orderIndex];
  }

  public async getAvailableOrders(): Promise<Order[]> {
    const orders = await this.getOrders();
    return orders.filter(order => order.status === OrderStatus.PENDING);
  }

  public async acceptOrder(orderId: string, driverId: string): Promise<Order | null> {
    return this.assignDriver(orderId, driverId);
  }

  public async getOrderWithDriverInfo(orderId: string): Promise<Order | null> {
    return this.getOrderById(orderId);
  }

  public async getOrdersByDriver(driverId: string): Promise<Order[]> {
    const orders = await this.getOrders();
    return orders.filter(order => order.driverId === driverId);
  }

  public async refreshDemoOrders(): Promise<void> {
    await this.createDemoOrders();
  }

  public async getAllOrders(): Promise<Order[]> {
    return this.getOrders();
  }

  public async calculateDeliveryQuote(
    packages: Package[], 
    distance: number, 
    deliveryWindow: 'next-day' | 'same-day' | 'rush' = 'next-day',
    customerId?: string
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
      totalWeight,
      numberOfPackages: packages.length
    };
  }

  private async calculateLoyaltyDiscount(customerId: string, subtotal: number): Promise<{discount: number, percent: number}> {
    try {
      // Get customer's order history
      const orders = await this.getOrders();
      const customerOrders = orders.filter(order => 
        order.customerId === customerId && 
        order.status === 'delivered'
      );
      
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

