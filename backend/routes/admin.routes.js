const express = require('express');
const {
  getUsers,
  getUserById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getQuizAnalytics,
  getQuizzes,
  getQuizAnalyticsById
} = require('../controllers/admin.controller');
const { protect, admin } = require('../middleware/auth.middleware');

const router = express.Router();

// All routes require authentication and admin role
router.use(protect);
router.use(admin);

// User routes
router.get('/users', getUsers);
router.get('/users/:id', getUserById);

// Quiz routes
router.get('/quizzes', getQuizzes);
router.post('/quizzes', createQuiz);
router.put('/quizzes/:id', updateQuiz);
router.delete('/quizzes/:id', deleteQuiz);
router.get('/quizzes/:id/analytics', getQuizAnalyticsById);

// Analytics routes
router.get('/analytics/quizzes', getQuizAnalytics);

module.exports = router; 