#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 BoxBus Environment Setup');
console.log('============================\n');

// Check if .env already exists
const envPath = path.join(__dirname, 'backend', '.env');
if (fs.existsSync(envPath)) {
  console.log('⚠️  .env file already exists in backend/');
  console.log('   Please edit it manually or delete it to run this setup.\n');
  process.exit(0);
}

// Read the example file
const examplePath = path.join(__dirname, 'backend', 'env.example');
if (!fs.existsSync(examplePath)) {
  console.log('❌ env.example file not found in backend/');
  process.exit(1);
}

const envContent = fs.readFileSync(examplePath, 'utf8');

console.log('📝 Setting up your environment file...\n');

// Ask for MongoDB URI
rl.question('Enter your MongoDB Atlas connection string: ', (mongodbUri) => {
  if (!mongodbUri.trim()) {
    console.log('❌ MongoDB URI is required');
    process.exit(1);
  }

  // Ask for JWT Secret
  rl.question('Enter a JWT secret (or press Enter for auto-generated): ', (jwtSecret) => {
    if (!jwtSecret.trim()) {
      jwtSecret = require('crypto').randomBytes(64).toString('hex');
      console.log('🔐 Auto-generated JWT secret');
    }

    // Replace placeholders
    let finalEnv = envContent
      .replace('mongodb+srv://username:password@cluster.mongodb.net/boxbus', mongodbUri.trim())
      .replace('your-super-secret-jwt-key-here', jwtSecret.trim());

    // Write the .env file
    fs.writeFileSync(envPath, finalEnv);
    
    console.log('\n✅ Environment file created successfully!');
    console.log('📍 Location: backend/.env');
    console.log('\n🔧 Next steps:');
    console.log('1. Test your MongoDB connection: cd backend && npm run dev');
    console.log('2. Set up Google Maps API for distance calculations');
    console.log('3. Configure SendGrid for email notifications');
    console.log('4. Set up Twilio for SMS notifications');
    
    rl.close();
  });
});

rl.on('close', () => {
  console.log('\n🎉 Setup complete! Happy coding!');
});





