const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const quizRoutes = require('./routes/quiz.routes');
const adminRoutes = require('./routes/admin.routes');
const categoryRoutes = require('./routes/categoryRoutes');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('QuizSoc API is running!');
});

// Seed categories on startup
const Category = require('./models/Category');
const seedCategories = async () => {
  try {
    // Check if categories exist
    const count = await Category.countDocuments();
    if (count === 0) {
      console.log('No categories found, seeding initial categories...');
      
      // Categories to add
      const categories = [
        { name: 'Numerical Reasoning' },
        { name: 'Verbal Reasoning' },
        { name: 'Mechanical Aptitude' },
        { name: 'Logical Reasoning' },
        { name: 'General Knowledge' }
      ];
      
      // Add categories
      await Category.insertMany(categories);
      console.log(`${categories.length} categories created successfully`);
    } else {
      console.log(`${count} categories already exist, skipping seeding`);
    }
  } catch (error) {
    console.error('Error seeding categories:', error.message);
  }
};

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Server configuration
const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  // Seed categories after server start
  await seedCategories();
}); 