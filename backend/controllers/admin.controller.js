const User = require('../models/user.model');
const Quiz = require('../models/quiz.model');
const Result = require('../models/result.model');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({ isAdmin: false }).select('-password');

    res.json({
      success: true,
      count: users.length,
      data: users
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

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate({
        path: 'quizzes.quiz',
        select: 'title'
      })
      .populate({
        path: 'quizzes.result',
        select: 'score detailed_results.accuracy detailed_results.speed'
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
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

// @desc    Create a new quiz
// @route   POST /api/admin/quizzes
// @access  Private/Admin
exports.createQuiz = async (req, res) => {
  try {
    console.log('Received quiz data:', JSON.stringify(req.body, null, 2));
    
    // Destructure all fields from request body
    const { title, description, time_limit, is_active, questions } = req.body;

    // Validate that required fields are present
    if (!title || !description || !questions || !Array.isArray(questions)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description and questions array'
      });
    }
    
    // Validate each question structure
    for (const question of questions) {
      if (!question.question || !question.options || !question.correct_answer || !question.explanation) {
        return res.status(400).json({
          success: false,
          message: 'Each question must have question text, options array, correct_answer, and explanation'
        });
      }
      
      // Make sure correct_answer exists in options
      if (!question.options.includes(question.correct_answer)) {
        return res.status(400).json({
          success: false,
          message: 'The correct answer must be one of the options'
        });
      }
    }

    // Create quiz with all fields
    const quiz = await Quiz.create({
      title,
      description,
      time_limit: time_limit || 45, // Default to 45 minutes if not provided
      is_active: is_active !== undefined ? is_active : true, // Default to true if not provided
      questions
    });

    res.status(201).json({
      success: true,
      data: quiz
    });
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update quiz
// @route   PUT /api/admin/quizzes/:id
// @access  Private/Admin
exports.updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    res.json({
      success: true,
      data: quiz
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

// @desc    Delete quiz
// @route   DELETE /api/admin/quizzes/:id
// @access  Private/Admin
exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Instead of deleting, set to inactive
    quiz.is_active = false;
    await quiz.save();

    res.json({
      success: true,
      data: {}
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

// @desc    Get quiz analytics
// @route   GET /api/admin/analytics/quizzes
// @access  Private/Admin
exports.getQuizAnalytics = async (req, res) => {
  try {
    // Get aggregate data for each quiz segment
    const analytics = await Result.aggregate([
      {
        $lookup: {
          from: 'quizzes',
          localField: 'quiz',
          foreignField: '_id',
          as: 'quiz_info'
        }
      },
      {
        $unwind: '$quiz_info'
      },
      {
        $group: {
          _id: '$quiz_info.title',
          totalAttempts: { $sum: 1 },
          averageScore: { $avg: '$score' },
          averageTimeSpent: { $avg: '$detailed_results.time_spent' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      success: true,
      data: analytics
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

// @desc    Get all quizzes
// @route   GET /api/admin/quizzes
// @access  Private/Admin
exports.getQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({}).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: quizzes.length,
      data: quizzes
    });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get analytics for a specific quiz
// @route   GET /api/admin/quizzes/:id/analytics
// @access  Private/Admin
exports.getQuizAnalyticsById = async (req, res) => {
  try {
    const quizId = req.params.id;
    
    // Get the quiz to verify it exists
    const quiz = await Quiz.findById(quizId);
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    // Get all attempts for this quiz
    const results = await Result.find({ quiz: quizId })
      .populate('user', 'username email');
    
    if (results.length === 0) {
      return res.json({
        success: true,
        data: {
          totalAttempts: 0,
          averageScore: 0,
          passingRate: 0,
          averageTime: 0,
          scoreDistribution: [0, 0, 0, 0, 0],
          questionPerformance: [],
          recentAttempts: []
        }
      });
    }
    
    // Calculate statistics
    const totalAttempts = results.length;
    const totalScore = results.reduce((sum, result) => sum + (result.score || 0), 0);
    const averageScore = totalScore / totalAttempts;
    
    // Calculate passing rate (score >= 70%)
    const passingCount = results.filter(result => (result.score || 0) >= 70).length;
    const passingRate = (passingCount / totalAttempts) * 100;
    
    // Calculate average time spent
    let totalTimeSpent = 0;
    let timeDataCount = 0;
    
    results.forEach(result => {
      if (result.detailed_results && result.detailed_results.time_spent) {
        totalTimeSpent += result.detailed_results.time_spent;
        timeDataCount++;
      }
    });
    
    const averageTime = timeDataCount > 0 ? totalTimeSpent / timeDataCount : 0;
    
    // Score distribution in ranges (0-20%, 21-40%, etc.)
    const scoreDistribution = [0, 0, 0, 0, 0];
    
    results.forEach(result => {
      const score = result.score || 0;
      if (score <= 20) scoreDistribution[0]++;
      else if (score <= 40) scoreDistribution[1]++;
      else if (score <= 60) scoreDistribution[2]++;
      else if (score <= 80) scoreDistribution[3]++;
      else scoreDistribution[4]++;
    });
    
    // Question performance
    const questionPerformance = [];
    
    // Initialize question performance tracking
    if (quiz.questions && quiz.questions.length > 0) {
      quiz.questions.forEach((question, index) => {
        questionPerformance.push({
          id: index,
          text: question.question,
          correctCount: 0,
          totalAttempts: 0,
          correctRate: 0,
          totalTime: 0,
          timeCount: 0,
          averageTime: 0
        });
      });
      
      // Calculate performance for each question
      results.forEach(result => {
        if (result.detailed_results && result.detailed_results.question_results) {
          result.detailed_results.question_results.forEach((qResult, index) => {
            if (index < questionPerformance.length) {
              questionPerformance[index].totalAttempts++;
              if (qResult.correct) {
                questionPerformance[index].correctCount++;
              }
              
              // Track time spent on each question if available
              if (qResult.time_spent) {
                questionPerformance[index].totalTime += qResult.time_spent;
                questionPerformance[index].timeCount++;
              }
            }
          });
        }
      });
      
      // Calculate correct rate and average time for each question
      questionPerformance.forEach(question => {
        question.correctRate = question.totalAttempts > 0 
          ? question.correctCount / question.totalAttempts 
          : 0;
          
        question.averageTime = question.timeCount > 0
          ? question.totalTime / question.timeCount
          : 0;
      });
    }
    
    // Recent attempts (latest 5)
    const recentAttempts = results
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(result => ({
        id: result._id,
        userName: result.user ? result.user.username : 'Anonymous',
        score: result.score || 0,
        timeTaken: result.detailed_results && result.detailed_results.time_spent 
          ? result.detailed_results.time_spent 
          : 0,
        date: result.createdAt
      }));
    
    res.json({
      success: true,
      data: {
        totalAttempts,
        averageScore,
        passingRate,
        averageTime,
        scoreDistribution,
        questionPerformance,
        recentAttempts
      }
    });
  } catch (error) {
    console.error('Error fetching quiz analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}; 