const express = require('express');
const Order = require('../models/Order');
const { auth, isDriver, isOwnerOrAdmin } = require('../middleware/auth');

const router = express.Router();

// Create new order
router.post('/', auth, async (req, res) => {
  try {
    const orderData = {
      ...req.body,
      customer: req.user._id
    };

    // Calculate price using the BoxBus pricing algorithm
    const order = new Order(orderData);
    const calculatedPrice = order.calculatePrice();
    
    // Update orderData with calculated price
    orderData.price = calculatedPrice;

    const finalOrder = new Order(orderData);
    await finalOrder.save();

    res.status(201).json({
      message: 'Order created successfully',
      order: finalOrder
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Error creating order' });
  }
});

// Get all orders for current user
router.get('/my-orders', auth, async (req, res) => {
  try {
    let orders;
    if (req.user.userType === 'driver') {
      // Drivers see orders assigned to them
      orders = await Order.find({ driver: req.user._id })
        .populate('customer', 'firstName lastName email phone')
        .sort({ createdAt: -1 });
    } else {
      // Customers see their own orders
      orders = await Order.find({ customer: req.user._id })
        .populate('driver', 'firstName lastName phone')
        .sort({ createdAt: -1 });
    }
    
    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// Get order by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'firstName lastName email phone')
      .populate('driver', 'firstName lastName phone');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user can access this order
    isOwnerOrAdmin(order.customer._id.toString())(req, res, () => {
      res.json(order);
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Error fetching order' });
  }
});

// Update order status (drivers and order owners)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user can update this order
    isOwnerOrAdmin(order.customer._id.toString())(req, res, async () => {
      // Only allow certain status transitions
      const allowedTransitions = {
        'pending': ['accepted', 'cancelled'],
        'accepted': ['picked-up', 'cancelled'],
        'picked-up': ['in-transit'],
        'in-transit': ['delivered'],
        'delivered': [],
        'cancelled': []
      };

      if (!allowedTransitions[order.status].includes(status)) {
        return res.status(400).json({ 
          message: `Cannot change status from ${order.status} to ${status}` 
        });
      }

      // Update delivery time if status is 'delivered'
      if (status === 'delivered') {
        order.actualDelivery = new Date();
      }

      order.status = status;
      await order.save();

      res.json({ message: 'Order status updated successfully', order });
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Error updating order status' });
  }
});

// Assign driver to order (admin or customer)
router.patch('/:id/assign-driver', auth, async (req, res) => {
  try {
    const { driverId } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user can assign driver to this order
    isOwnerOrAdmin(order.customer._id.toString())(req, res, async () => {
      order.driver = driverId;
      order.status = 'accepted';
      await order.save();

      res.json({ message: 'Driver assigned successfully', order });
    });
  } catch (error) {
    console.error('Assign driver error:', error);
    res.status(500).json({ message: 'Error assigning driver' });
  }
});

// Get available orders for drivers
router.get('/available/for-drivers', auth, isDriver, async (req, res) => {
  try {
    const orders = await Order.find({ 
      status: 'pending',
      driver: { $exists: false }
    }).populate('customer', 'firstName lastName city state');
    
    res.json(orders);
  } catch (error) {
    console.error('Get available orders error:', error);
    res.status(500).json({ message: 'Error fetching available orders' });
  }
});

// Accept order (driver)
router.patch('/:id/accept', auth, isDriver, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'pending' || order.driver) {
      return res.status(400).json({ message: 'Order is not available for assignment' });
    }

    order.driver = req.user._id;
    order.status = 'accepted';
    await order.save();

    res.json({ message: 'Order accepted successfully', order });
  } catch (error) {
    console.error('Accept order error:', error);
    res.status(500).json({ message: 'Error accepting order' });
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

module.exports = router;


