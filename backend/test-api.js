const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test basic server connection
async function testServer() {
  try {
    const response = await axios.get('http://localhost:5000/');
    console.log('✅ Server is running:', response.data);
  } catch (error) {
    console.log('❌ Server connection failed:', error.message);
  }
}

// Test registration endpoint
async function testRegistration() {
  try {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      phone: '555-0123',
      userType: 'customer'
    };

    const response = await axios.post(`${BASE_URL}/auth/register`, userData);
    console.log('✅ Registration successful:', response.data.message);
    return response.data.token;
  } catch (error) {
    console.log('❌ Registration failed:', error.response?.data?.message || error.message);
    return null;
  }
}

// Test login endpoint
async function testLogin() {
  try {
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };

    const response = await axios.post(`${BASE_URL}/auth/login`, loginData);
    console.log('✅ Login successful:', response.data.message);
    return response.data.token;
  } catch (error) {
    console.log('❌ Login failed:', error.response?.data?.message || error.message);
    return null;
  }
}

// Test protected endpoint
async function testProtectedEndpoint(token) {
  if (!token) {
    console.log('❌ No token available for protected endpoint test');
    return;
  }

  try {
    const response = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Protected endpoint successful:', response.data.user.email);
  } catch (error) {
    console.log('❌ Protected endpoint failed:', error.response?.data?.message || error.message);
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting API tests...\n');
  
  await testServer();
  console.log('');
  
  const token = await testRegistration();
  console.log('');
  
  if (token) {
    await testProtectedEndpoint(token);
  } else {
    await testLogin();
  }
  
  console.log('\n✨ API tests completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testServer, testRegistration, testLogin, testProtectedEndpoint };
