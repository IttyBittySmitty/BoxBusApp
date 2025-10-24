// API Configuration
// This file centralizes all API configuration for easy environment switching

// Production backend URL - your actual Render URL
const PRODUCTION_API_URL = 'https://boxbusapp-backend.onrender.com';

// Use environment variable if set, otherwise use production URL
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || PRODUCTION_API_URL;

export { API_BASE_URL };
