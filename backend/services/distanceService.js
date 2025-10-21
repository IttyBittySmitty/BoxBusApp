const axios = require('axios');

class DistanceService {
  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY;
    console.log('🔑 DistanceService constructor - API Key exists:', !!this.apiKey);
  }

  async geocodeAddress(address) {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${this.apiKey}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.status !== "OK" || !data.results.length) {
        console.error("Geocode failed:", data);
        throw new Error(`Could not geocode address: ${address}. Google Maps status: ${data.status}. Error: ${data.error_message || 'No error message'}`);
      }

      return data.results[0].geometry.location;
    } catch (error) {
      console.error("Geocoding error:", error);
      throw new Error(`Geocoding failed for ${address}: ${error.message}`);
    }
  }

  async getDrivingDistance(startCoords, endCoords) {
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${startCoords.lat},${startCoords.lng}&destinations=${endCoords.lat},${endCoords.lng}&key=${this.apiKey}&units=metric`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== "OK" || data.rows[0].elements[0].status !== "OK") {
      console.error("Distance matrix failed:", data);
      throw new Error("Could not calculate driving distance");
    }

    const element = data.rows[0].elements[0];
    return {
      distance: element.distance.value, // in meters
      duration: element.duration.value // in seconds
    };
  }

  async calculateDistance(startAddress, endAddress) {
    try {
      console.log('🚀 Starting distance calculation...');
      console.log('📍 Start address:', startAddress);
      console.log('📍 End address:', endAddress);
      
      // Geocode both addresses with proper error handling
      let startCoords, endCoords;
      
      try {
        startCoords = await this.geocodeAddress(startAddress);
        console.log("Pickup geocoded:", startCoords);
      } catch (err) {
        console.error("Pickup geocode error:", err.message);
        throw new Error(`Could not geocode pickup address: ${startAddress}. ${err.message}`);
      }
      
      try {
        endCoords = await this.geocodeAddress(endAddress);
        console.log("Dropoff geocoded:", endCoords);
      } catch (err) {
        console.error("Dropoff geocode error:", err.message);
        throw new Error(`Could not geocode dropoff address: ${endAddress}. ${err.message}`);
      }
      
      // Calculate driving distance
      const distance = await this.getDrivingDistance(startCoords, endCoords);
      
      return {
        distance: distance.distance, // in meters
        duration: distance.duration, // in seconds
        startCoords,
        endCoords
      };
    } catch (error) {
      console.error('❌ Distance calculation error:', error);
      throw error;
    }
  }

  metersToKilometers(meters) {
    return meters / 1000;
  }

  formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }
}

module.exports = new DistanceService();