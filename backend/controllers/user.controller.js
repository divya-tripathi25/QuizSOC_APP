const User = require('../models/user.model');
const Result = require('../models/result.model');

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update fields if provided
    if (req.body.username) user.username = req.body.username;
    if (req.body.email) user.email = req.body.email;
    if (req.body.password) user.password = req.body.password;

    const updatedUser = await user.save();

    res.json({
      success: true,
      user: {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get user quiz history
// @route   GET /api/users/quiz-history
// @access  Private
exports.getUserQuizHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'quizzes.quiz',
        select: 'title'
      })
      .populate({
        path: 'quizzes.result',
        select: 'score detailed_results.accuracy detailed_results.speed createdAt'
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Format quiz history and filter out any records with missing quiz or result data
    const quizHistory = user.quizzes
      .filter(item => item && item.quiz && item.result)
      .map(item => ({
        quiz: item.quiz,
        result: item.result,
        completedAt: item.result ? item.result.createdAt : new Date()
      }));

    res.json({
      success: true,
      data: quizHistory
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get user performance metrics
// @route   GET /api/users/performance
// @access  Private
exports.getUserPerformance = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get all results for the user
    const results = await Result.find({ user: req.user._id })
      .populate('quiz', 'title');

    // Calculate metrics by quiz category
    const performanceByCategory = {};

    results.forEach(result => {
      // Skip results with missing quiz data
      if (!result.quiz || !result.quiz.title) return;
      
      const quizTitle = result.quiz.title;
      
      if (!performanceByCategory[quizTitle]) {
        performanceByCategory[quizTitle] = {
          attempts: 0,
          totalScore: 0,
          averageScore: 0,
          averageAccuracy: 0,
          highestScore: 0,
          totalTimeSpent: 0 // Track total time spent per category
        };
      }

      const category = performanceByCategory[quizTitle];
      category.attempts += 1;
      category.totalScore += result.score || 0;
      
      // Add time spent for this quiz to category total
      if (result.detailed_results && typeof result.detailed_results.time_spent === 'number') {
        category.totalTimeSpent += result.detailed_results.time_spent;
      }
      
      // Parse accuracy percentage safely
      if (result.detailed_results && result.detailed_results.accuracy) {
        // Parse accuracy percentage (removing the % sign if necessary)
        let accuracyValue = 0;
        try {
          const accuracyStr = result.detailed_results.accuracy.toString();
          accuracyValue = parseFloat(accuracyStr.replace('%', ''));
          if (isNaN(accuracyValue)) accuracyValue = 0;
        } catch (e) {
          accuracyValue = 0;
        }
        category.averageAccuracy += accuracyValue;
      }
      
      if ((result.score || 0) > category.highestScore) {
        category.highestScore = result.score || 0;
      }
      
      // Recalculate average
      category.averageScore = category.totalScore / category.attempts;
      category.averageAccuracy = category.averageAccuracy / category.attempts;
    });

    res.json({
      success: true,
      data: performanceByCategory
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}; 