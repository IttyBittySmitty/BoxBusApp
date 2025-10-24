const express = require('express');
const User = require('../models/User');
const { auth, isOwnerOrAdmin } = require('../middleware/auth');

const router = express.Router();

// Get current user profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userResponse = user.toObject();
    userResponse.id = userResponse._id.toString();
    res.json(userResponse);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Error fetching user' });
  }
});

// Get all users (admin only)
router.get('/', auth, async (req, res) => {
  try {
    // Check if user is admin
    const currentUser = await User.findById(req.user.id);
    if (currentUser.userType !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const users = await User.find().select('-password');
    // Transform _id to id for frontend compatibility
    const transformedUsers = users.map(user => ({
      ...user.toObject(),
      id: user._id.toString()
    }));
    res.json(transformedUsers);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Get archived users (admin only)
router.get('/archived', auth, async (req, res) => {
  try {
    // Check if user is admin
    const currentUser = await User.findById(req.user.id);
    if (currentUser.userType !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const users = await User.find({ isArchived: true }).select('-password');
    // Transform _id to id for frontend compatibility
    const transformedUsers = users.map(user => ({
      ...user.toObject(),
      id: user._id.toString()
    }));
    res.json(transformedUsers);
  } catch (error) {
    console.error('Get archived users error:', error);
    res.status(500).json({ message: 'Error fetching archived users' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Use bcrypt to compare hashed passwords
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if user is archived
    if (user.isArchived) {
      return res.status(403).json({ message: 'Account has been archived. Please contact support.' });
    }

    // Check if driver is approved
    if (user.userType === 'driver' && !user.isApproved) {
      return res.status(403).json({ message: 'Driver account pending approval' });
    }

    // Generate JWT token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;
    userResponse.id = userResponse._id.toString();
    
    res.json({ message: 'Login successful', user: userResponse, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error during login' });
  }
});

// Create new user (registration)
router.post('/', async (req, res) => {
  try {
    console.log('🔍 REGISTRATION: Received request body:', req.body);
    const { email, password, firstName, lastName, phone, address, userType = 'customer' } = req.body;
    
    console.log('🔍 REGISTRATION: Parsed data:', { email, firstName, lastName, userType });
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('🔍 REGISTRATION: User already exists:', email);
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    console.log('🔍 REGISTRATION: Creating new user...');
    // Create new user
    const newUser = new User({
      email,
      password, // Password will be hashed by pre-save middleware
      firstName,
      lastName,
      phone,
      address: typeof address === 'string' ? { street: address } : address, // Handle both string and object addresses
      userType,
      isApproved: userType === 'customer' ? true : false, // Customers auto-approved, drivers need approval
    });

    console.log('🔍 REGISTRATION: Saving user to database...');
    await newUser.save();
    console.log('🔍 REGISTRATION: User saved successfully with ID:', newUser._id);
    
    // Return user without password
    const userResponse = newUser.toObject();
    delete userResponse.password;
    
    console.log('🔍 REGISTRATION: Returning success response');
    res.status(201).json({ message: 'User created successfully', user: userResponse });
  } catch (error) {
    console.error('🔍 REGISTRATION: Create user error:', error);
    console.error('🔍 REGISTRATION: Error details:', error.message);
    console.error('🔍 REGISTRATION: Error stack:', error.stack);
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

// Approve driver
router.put('/:id/approve', auth, async (req, res) => {
  try {
    // Check if current user is admin
    const currentUser = await User.findById(req.user.id);
    if (currentUser.userType !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.userType !== 'driver') {
      return res.status(400).json({ message: 'Only drivers can be approved' });
    }

    user.isApproved = true;
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json({ message: 'Driver approved successfully', user: userResponse });
  } catch (error) {
    console.error('Approve driver error:', error);
    res.status(500).json({ message: 'Error approving driver' });
  }
});

// Archive user
router.put('/:id/archive', auth, async (req, res) => {
  try {
    // Check if current user is admin
    const currentUser = await User.findById(req.user.id);
    if (currentUser.userType !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isArchived = true;
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json({ message: 'User archived successfully', user: userResponse });
  } catch (error) {
    console.error('Archive user error:', error);
    res.status(500).json({ message: 'Error archiving user' });
  }
});

// Unarchive user
router.put('/:id/unarchive', auth, async (req, res) => {
  try {
    // Check if current user is admin
    const currentUser = await User.findById(req.user.id);
    if (currentUser.userType !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isArchived = false;
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json({ message: 'User unarchived successfully', user: userResponse });
  } catch (error) {
    console.error('Unarchive user error:', error);
    res.status(500).json({ message: 'Error unarchiving user' });
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
      const userResponse = user.toObject();
      delete userResponse.password;
      userResponse.id = userResponse._id.toString();
      res.json(userResponse);
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

      const userResponse = updatedUser.toObject();
      userResponse.id = userResponse._id.toString();
      res.json({ message: 'User updated successfully', user: userResponse });
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
});

// Approve driver
router.put('/:id/approve', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    if (currentUser.userType !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.userType !== 'driver') {
      return res.status(400).json({ message: 'Only drivers can be approved' });
    }

    user.isApproved = true;
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;
    userResponse.id = userResponse._id.toString();

    res.json({ message: 'Driver approved successfully', user: userResponse });
  } catch (error) {
    console.error('Approve driver error:', error);
    res.status(500).json({ message: 'Error approving driver' });
  }
});

// Public endpoint to check users (for debugging)
router.get('/debug/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ 
      message: 'Users in database', 
      count: users.length, 
      users: users.map(user => ({
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
        isApproved: user.isApproved,
        isArchived: user.isArchived,
        createdAt: user.createdAt
      }))
    });
  } catch (error) {
    console.error('Debug users error:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

module.exports = router;


