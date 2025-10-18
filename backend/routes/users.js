const express = require('express');
const User = require('../models/User');
const { auth, isAdmin, isOwnerOrAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all users (admin only)
router.get('/', auth, isAdmin, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Get user by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user can access this profile
    isOwnerOrAdmin(user._id.toString())(req, res, () => {
      res.json(user);
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Error fetching user' });
  }
});

// Update user by ID
router.put('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user can update this profile
    isOwnerOrAdmin(user._id.toString())(req, res, async () => {
      const updates = req.body;
      delete updates.password; // Don't allow password update through this route
      delete updates.email; // Don't allow email update through this route

      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
      ).select('-password');

      res.json({ message: 'User updated successfully', user: updatedUser });
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
});

// Delete user (admin only)
router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
});

// Get drivers (for order assignment)
router.get('/drivers/available', auth, async (req, res) => {
  try {
    const drivers = await User.find({ 
      userType: 'driver',
      isVerified: true 
    }).select('-password');
    res.json(drivers);
  } catch (error) {
    console.error('Get drivers error:', error);
    res.status(500).json({ message: 'Error fetching drivers' });
  }
});

module.exports = router;


