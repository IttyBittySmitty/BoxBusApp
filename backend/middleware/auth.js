const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};



// Middleware to check if user owns the resource
const isOwnerOrAdmin = (resourceUserId) => {
  return (req, res, next) => {
    if (req.user._id.toString() === resourceUserId.toString()) {
      return next();
    }
    res.status(403).json({ message: 'Access denied.' });
  };
};

module.exports = { auth, isOwnerOrAdmin };

