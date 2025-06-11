const express = require('express');
const {
  getQuizzes,
  getQuizById,
  submitQuiz,
  getUserResults,
  getResultById
} = require('../controllers/quiz.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Quiz routes
router.get('/', getQuizzes);
router.get('/:id', getQuizById);
router.post('/:id/submit', submitQuiz);

// Results routes
router.get('/results', getUserResults);
router.get('/results/:id', getResultById);

module.exports = router; 