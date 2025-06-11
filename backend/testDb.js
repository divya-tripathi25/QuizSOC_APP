const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Print current directory and files
console.log('Current directory:', __dirname);
console.log('Environment variables:', process.env.NODE_ENV);

// Check if .env file exists
const envPath = path.resolve(__dirname, '.env');
console.log('.env file path:', envPath);
console.log('.env file exists:', fs.existsSync(envPath));

// Load environment variables
dotenv.config();

// Log MongoDB URI (masked for security)
if (process.env.MONGODB_URI) {
  const maskedURI = process.env.MONGODB_URI.replace(/mongodb\+srv:\/\/([^:]+):([^@]+)@/, 'mongodb+srv://$1:****@');
  console.log('MongoDB URI is defined:', maskedURI);
} else {
  console.log('MongoDB URI is UNDEFINED');
}

// Attempt to connect to MongoDB
console.log('Attempting to connect to MongoDB...');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB Connected Successfully');
    console.log('Closing connection...');
    mongoose.disconnect()
      .then(() => console.log('MongoDB Disconnected'))
      .catch(err => console.error('Error disconnecting:', err))
      .finally(() => process.exit(0));
  })
  .catch(err => {
    console.error('MongoDB Connection Error:');
    console.error(err);
    process.exit(1);
  }); 