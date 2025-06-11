const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Models
const User = require('../models/user.model');
const Quiz = require('../models/quiz.model');

// Sample data
const quizzes = require('./quizzes');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quizsoc')
  .then(() => console.log('MongoDB connected for seeding'))
  .catch(err => console.error('MongoDB connection error:', err));

// Import data function
const importData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Quiz.deleteMany();

    console.log('Data cleared...');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: adminPassword,
      isAdmin: true
    });

    console.log('Admin user created');

    // Create regular user
    const userPassword = await bcrypt.hash('user123', 10);
    const user = await User.create({
      username: 'testuser',
      email: 'user@example.com',
      password: userPassword,
      isAdmin: false
    });

    console.log('Test user created');

    // Create quizzes
    const createdQuizzes = await Quiz.insertMany(quizzes);
    
    console.log(`${createdQuizzes.length} quizzes created`);
    console.log('Data imported successfully!');
    
    process.exit();
  } catch (error) {
    console.error(`Error importing data: ${error}`);
    process.exit(1);
  }
};

// Delete data function
const destroyData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Quiz.deleteMany();

    console.log('Data destroyed successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error destroying data: ${error}`);
    process.exit(1);
  }
};

// Determine which function to run based on command line args
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
} 