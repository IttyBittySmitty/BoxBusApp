const express = require('express');
const Order = require('../models/Order');
const { auth, isOwnerOrAdmin } = require('../middleware/auth');
const distanceService = require('../services/distanceService');

const router = express.Router();

// Get all orders (admin only)
router.get('/', auth, async (req, res) => {
  try {
    // Only admins can see all orders
    if (req.user.userType !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const orders = await Order.find()
      .populate('customer', 'firstName lastName email phone')
      .populate('driver', 'firstName lastName email phone')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// Create new order
router.post('/', auth, async (req, res) => {
  try {
    // Transform string addresses to address objects
    const transformAddress = (addressString) => {
      // Simple parsing - in production you'd want more robust address parsing
      const parts = addressString.split(', ');
      return {
        street: parts[0] || addressString,
        city: parts[1] || 'Unknown',
        state: parts[2] || 'BC',
        zipCode: parts[3] || 'V0V 0V0'
      };
    };

    // Transform packages array to packageDetails object
    const packages = req.body.packages || [];
    const firstPackage = packages[0] || { weight: 0, length: 0, width: 0, height: 0, description: '' };
    
    const orderData = {
      customer: req.body.customerId || req.user._id,
      pickupAddress: transformAddress(req.body.pickupAddress),
      deliveryAddress: transformAddress(req.body.dropoffAddress),
      packageDetails: {
        weight: req.body.totalWeight || firstPackage.weight,
        dimensions: {
          length: firstPackage.length || 0,
          width: firstPackage.width || 0,
          height: firstPackage.height || 0
        },
        description: firstPackage.description || '',
        numberOfPackages: packages.length || 1
      },
      distance: req.body.distance || 0,
      deliveryWindow: req.body.deliveryWindow || 'next-day',
      deliveryCutoff: req.body.deliveryCutoff || new Date(),
      specialInstructions: req.body.specialInstructions || '',
      // Price will be calculated by the model, but we can override if provided
      price: req.body.price ? {
        basePrice: req.body.price.basePrice,
        distanceFee: req.body.price.distanceFee,
        weightFee: req.body.price.weightFee,
        packageFee: req.body.price.packageFee,
        deliveryWindowMultiplier: req.body.price.deliveryWindowMultiplier,
        subtotal: req.body.price.subtotal,
        gst: req.body.price.gst,
        total: req.body.price.total || req.body.price.totalPrice
      } : undefined
    };

    // Create the order
    const finalOrder = new Order(orderData);
    
    // Use provided price or calculate using the BoxBus pricing algorithm
    if (orderData.price) {
      finalOrder.price = orderData.price;
    } else {
      const calculatedPrice = finalOrder.calculatePrice();
      finalOrder.price = calculatedPrice;
    }
    
    await finalOrder.save();

    // Transform _id to id for frontend compatibility
    const orderResponse = {
      ...finalOrder.toObject(),
      id: finalOrder._id.toString()
    };

    res.status(201).json(orderResponse);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Error creating order' });
  }
});

// Get all orders for current user
router.get('/my-orders', auth, async (req, res) => {
  try {
    // Customers see their own orders
    const orders = await Order.find({ customer: req.user._id })
      .populate('customer', 'firstName lastName email phone')
      .populate('driver', 'firstName lastName email phone')
      .sort({ createdAt: -1 });
    
    // Transform _id to id for frontend compatibility
    const transformedOrders = orders.map(order => ({
      ...order.toObject(),
      id: order._id.toString()
    }));
    
    res.json(transformedOrders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// Get available orders (for drivers) - MUST be before /:id route
router.get('/available', auth, async (req, res) => {
  try {
    // Only drivers can see available orders
    if (req.user.userType !== 'driver') {
      return res.status(403).json({ message: 'Access denied. Driver only.' });
    }

    const orders = await Order.find({ 
      status: 'PENDING',
      $or: [
        { driver: { $exists: false } },
        { driver: null },
        { driver: undefined }
      ]
    })
    .populate('customer', 'firstName lastName email phone')
    .sort({ createdAt: -1 });
    
    console.log('🔍 Available orders query result:', orders.length, 'orders');
    console.log('🔍 Available orders details:', orders.map(o => ({ id: o._id?.toString().slice(-8), status: o.status, driver: o.driver })));
    
    res.json(orders);
  } catch (error) {
    console.error('Get available orders error:', error);
    res.status(500).json({ message: 'Error fetching available orders' });
  }
});

// Get driver's assigned orders - MUST be before /:id route
router.get('/driver-orders', auth, async (req, res) => {
  try {
    // Only drivers can see their orders
    if (req.user.userType !== 'driver') {
      return res.status(403).json({ message: 'Access denied. Driver only.' });
    }

    const orders = await Order.find({ 
      driver: req.user._id,
      status: { $in: ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT'] }
    })
    .populate('customer', 'firstName lastName email phone')
    .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    console.error('Get driver orders error:', error);
    res.status(500).json({ message: 'Error fetching driver orders' });
  }
});

// Get driver's completed orders - MUST be before /:id route
router.get('/driver-completed', auth, async (req, res) => {
  try {
    // Only drivers can see their completed orders
    if (req.user.userType !== 'driver') {
      return res.status(403).json({ message: 'Access denied. Driver only.' });
    }

    const orders = await Order.find({ 
      driver: req.user._id,
      status: { $in: ['DELIVERED', 'CANCELLED'] }
    })
    .populate('customer', 'firstName lastName email phone')
    .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    console.error('Get driver completed orders error:', error);
    res.status(500).json({ message: 'Error fetching driver completed orders' });
  }
});

// Get order by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'firstName lastName email phone');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user can access this order
    isOwnerOrAdmin(order.customer._id.toString())(req, res, () => {
      const orderResponse = order.toObject();
      orderResponse.id = orderResponse._id.toString();
      res.json(orderResponse);
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Error fetching order' });
  }
});




// Calculate distance between two addresses
router.post('/calculate-distance', async (req, res) => {
  try {
    const { pickupAddress, dropoffAddress } = req.body;
    
    if (!pickupAddress || !dropoffAddress) {
      return res.status(400).json({ message: 'Both pickup and dropoff addresses are required' });
    }

    const distanceData = await distanceService.calculateDistance(pickupAddress, dropoffAddress);
    
    res.json({
      message: 'Distance calculated successfully',
      distance: {
        kilometers: distanceService.metersToKilometers(distanceData.distance),
        meters: distanceData.distance,
        duration: {
          minutes: distanceService.secondsToMinutes(distanceData.duration),
          seconds: distanceData.duration
        },
        startCoords: distanceData.startCoords,
        endCoords: distanceData.endCoords
      }
    });
  } catch (error) {
    console.error('Calculate distance error:', error);
    res.status(500).json({ message: 'Error calculating distance' });
  }
});

// Calculate price for an order (without saving)
router.post('/calculate-price', auth, async (req, res) => {
  try {
    const orderData = req.body;
    
    // Create a temporary order instance to calculate price
    const tempOrder = new Order(orderData);
    const calculatedPrice = tempOrder.calculatePrice();
    
    res.json({
      message: 'Price calculated successfully',
      price: calculatedPrice,
      breakdown: {
        basePrice: calculatedPrice.basePrice,
        distanceFee: calculatedPrice.distanceFee,
        weightFee: calculatedPrice.weightFee,
        packageFee: calculatedPrice.packageFee,
        total: calculatedPrice.total
      }
    });
  } catch (error) {
    console.error('Calculate price error:', error);
    res.status(500).json({ message: 'Error calculating price' });
  }
});


// Get completed orders for a specific customer
router.get('/customer/:customerId/completed', auth, async (req, res) => {
  try {
    const { customerId } = req.params;
    
    // Only admins or the customer themselves can access this
    if (req.user.userType !== 'admin' && req.user._id.toString() !== customerId) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const orders = await Order.find({ 
      customer: customerId,
      status: { $in: ['DELIVERED', 'CANCELLED'] }
    })
    .populate('customer', 'firstName lastName email phone')
    .populate('driver', 'firstName lastName email phone')
    .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    console.error('Get customer completed orders error:', error);
    res.status(500).json({ message: 'Error fetching completed orders' });
  }
});

// Assign driver to order
router.put('/:id/assign', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { driverId } = req.body;
    
    // Only drivers can assign themselves
    if (req.user.userType !== 'driver') {
      return res.status(403).json({ message: 'Access denied. Driver only.' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'PENDING') {
      return res.status(400).json({ message: 'Order is no longer available' });
    }

    // Assign the driver
    order.driver = req.user._id;
    order.status = 'ASSIGNED';
    order.updatedAt = new Date();
    await order.save();

    const populatedOrder = await Order.findById(id)
      .populate('customer', 'firstName lastName email phone')
      .populate('driver', 'firstName lastName email phone');

    res.json({
      message: 'Driver assigned successfully',
      order: populatedOrder
    });
  } catch (error) {
    console.error('Assign driver error:', error);
    res.status(500).json({ message: 'Error assigning driver' });
  }
});

// Update order status
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check permissions
    const isDriver = req.user.userType === 'driver' && order.driver.toString() === req.user._id.toString();
    const isCustomer = req.user.userType === 'customer' && order.customer.toString() === req.user._id.toString();
    const isAdmin = req.user.userType === 'admin';

    if (!isDriver && !isCustomer && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update status and timing fields
    order.status = status;
    order.updatedAt = new Date();
    
    if (status === 'PICKED_UP') {
      order.pickupTime = new Date();
    } else if (status === 'DELIVERED') {
      order.deliveryTime = new Date();
    }

    await order.save();

    const populatedOrder = await Order.findById(id)
      .populate('customer', 'firstName lastName email phone')
      .populate('driver', 'firstName lastName email phone');

    res.json({
      message: 'Order status updated successfully',
      order: populatedOrder
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Error updating order status' });
  }
});

// Cancel order
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check permissions
    const isCustomer = req.user.userType === 'customer' && order.customer.toString() === req.user._id.toString();
    const isAdmin = req.user.userType === 'admin';

    if (!isCustomer && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if order can be cancelled
    if (order.status === 'PICKED_UP' || order.status === 'IN_TRANSIT' || order.status === 'DELIVERED') {
      return res.status(400).json({ message: 'Order cannot be cancelled after pickup' });
    }

    order.status = 'CANCELLED';
    order.updatedAt = new Date();
    await order.save();

    const populatedOrder = await Order.findById(id)
      .populate('customer', 'firstName lastName email phone')
      .populate('driver', 'firstName lastName email phone');

    res.json({
      message: 'Order cancelled successfully',
      order: populatedOrder
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Error cancelling order' });
  }
});

// Update order (general update)
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check permissions
    const isCustomer = req.user.userType === 'customer' && order.customer.toString() === req.user._id.toString();
    const isDriver = req.user.userType === 'driver' && order.driver.toString() === req.user._id.toString();
    const isAdmin = req.user.userType === 'admin';

    if (!isCustomer && !isDriver && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update the order
    Object.assign(order, updateData);
    order.updatedAt = new Date();
    await order.save();

    const populatedOrder = await Order.findById(id)
      .populate('customer', 'firstName lastName email phone')
      .populate('driver', 'firstName lastName email phone');

    res.json({
      message: 'Order updated successfully',
      order: populatedOrder
    });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ message: 'Error updating order' });
  }
});

module.exports = router;


