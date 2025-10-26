// Simple startup script to handle environment setup
require('dotenv').config();

// Set default environment variables if not provided
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.PORT = process.env.PORT || '5000';
process.env.CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/scheme_recommender';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

console.log('🔧 Environment Configuration:');
console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`   PORT: ${process.env.PORT}`);
console.log(`   CLIENT_URL: ${process.env.CLIENT_URL}`);
console.log(`   MONGODB_URI: ${process.env.MONGODB_URI}`);
console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? 'Set' : 'Not Set'}`);

// Start the server
require('./server/index.js');
