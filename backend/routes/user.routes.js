const express = require('express');
const {
  updateUserProfile,
  getUserQuizHistory,
  getUserPerformance
} = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

router.put('/profile', updateUserProfile);
router.get('/quiz-history', getUserQuizHistory);
router.get('/performance', getUserPerformance);

module.exports = router; 