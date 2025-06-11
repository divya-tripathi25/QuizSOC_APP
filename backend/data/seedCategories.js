const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('../models/Category');
const path = require('path');

// Load environment variables - ensure we're loading from the correct path
dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log('Starting category seeding...');
console.log('MongoDB URI:', process.env.MONGODB_URI ? 'URI is defined' : 'URI is UNDEFINED');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

// Categories to add
const categories = [
  { name: 'Numerical Reasoning' },
  { name: 'Verbal Reasoning' },
  { name: 'Mechanical Aptitude' },
  { name: 'Logical Reasoning' },
  { name: 'General Knowledge' }
];

// Seed categories
const seedCategories = async () => {
  try {
    // Clear existing categories
    await Category.deleteMany({});
    console.log('Categories cleared');

    // Add new categories
    const createdCategories = await Category.insertMany(categories);
    console.log(`${createdCategories.length} categories created`);

    // Disconnect from MongoDB
    mongoose.disconnect();
    console.log('MongoDB Disconnected');
  } catch (error) {
    console.error(`Error during seeding: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
};

// Run the seeder
seedCategories(); 