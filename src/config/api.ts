// API Configuration
// This file centralizes all API configuration for easy environment switching

// Use environment variable if available, otherwise use production URL
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://boxbusapp-backend.onrender.com';

export { API_BASE_URL };
