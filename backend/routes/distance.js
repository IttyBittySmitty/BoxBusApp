const express = require('express');
const distanceService = require('../services/distanceService');

const router = express.Router();

// Calculate distance between two addresses
router.post('/calculate', async (req, res) => {
  try {
    const { pickupAddress, dropoffAddress } = req.body;

    // Validate required fields
    if (!pickupAddress || !dropoffAddress) {
      return res.status(400).json({ 
        message: 'Both pickup and dropoff addresses are required' 
      });
    }
    
    // Call the distance service
    const result = await distanceService.calculateDistance(pickupAddress, dropoffAddress);
    
    // Return formatted response
    res.json({
      distance: distanceService.metersToKilometers(result.distance),
      duration: distanceService.formatDuration(result.duration),
      startCoords: result.startCoords,
      endCoords: result.endCoords
    });
    
  } catch (error) {
    console.error('Distance calculation error:', error);
    res.status(500).json({ 
      message: 'Error calculating distance',
      error: error.message,
      debug: 'Backend route was hit successfully'
    });
  }
});

module.exports = router;