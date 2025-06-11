const Quiz = require('../models/quiz.model');
const Result = require('../models/result.model');
const User = require('../models/user.model');

// @desc    Get all quizzes
// @route   GET /api/quizzes
// @access  Private
exports.getQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ is_active: true }).select('title description time_limit');

    res.json({
      success: true,
      count: quizzes.length,
      data: quizzes
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

// @desc    Get quiz by ID
// @route   GET /api/quizzes/:id
// @access  Private
exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

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

// @desc    Submit quiz
// @route   POST /api/quizzes/:id/submit
// @access  Private
exports.submitQuiz = async (req, res) => {
  try {
    const { answers, timeSpent } = req.body;
    const quizId = req.params.id;

    // Get the quiz
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Calculate score
    let correctAnswers = 0;
    const detailedAnswers = [];

    for (let i = 0; i < answers.length; i++) {
      const answer = answers[i];
      const question = quiz.questions.id(answer.questionId);

      if (!question) {
        continue;
      }

      const isCorrect = answer.answer === question.correct_answer;
      
      if (isCorrect) {
        correctAnswers++;
      }

      detailedAnswers.push({
        question_id: question._id,
        user_answer: answer.answer,
        is_correct: isCorrect,
        time_taken: answer.timeTaken || 0
      });
    }

    // Calculate score based on TOTAL questions in the quiz (not answered questions)
    // This fixes the issue where partial answers could give 100% if all correct
    const totalQuestions = quiz.questions.length;
    
    // Calculate score as percentage of correct answers out of total questions
    const score = Math.floor((correctAnswers / totalQuestions) * 100);
    
    // Calculate additional metrics
    const accuracy = `${Math.floor((correctAnswers / totalQuestions) * 100)}%`;
    
    const questionsPerMinute = timeSpent > 0 ? (answers.length / (timeSpent / 60)).toFixed(2) : 0;
    const speed = `${questionsPerMinute} questions/minute`;
    
    // Ensure timeSpent is stored as an integer (minutes)
    const validTimeSpent = !isNaN(timeSpent) && timeSpent > 0 ? Math.ceil(timeSpent / 60) : 1;

    // Create result
    const result = await Result.create({
      user: req.user._id,
      quiz: quizId,
      score,
      total_questions: totalQuestions,
      answered_questions: answers.length,
      correct_answers: correctAnswers,
      detailed_results: {
        accuracy,
        speed,
        time_spent: validTimeSpent,
        answers: detailedAnswers
      }
    });

    // Update user's quizzes array
    await User.findByIdAndUpdate(req.user._id, {
      $push: { quizzes: { quiz: quizId, result: result._id } }
    });

    // Return result with detailed explanations
    const resultWithExplanations = {
      ...result.toObject(),
      questions: quiz.questions.map(q => ({
        _id: q._id,
        question: q.question,
        options: q.options,
        correct_answer: q.correct_answer,
        explanation: q.explanation
      }))
    };

    res.status(201).json({
      success: true,
      data: resultWithExplanations
    });
  } catch (error) {
    console.error("Error submitting quiz:", error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get user quiz results
// @route   GET /api/quizzes/results
// @access  Private
exports.getUserResults = async (req, res) => {
  try {
    const results = await Result.find({ user: req.user._id })
      .populate('quiz', 'title')
      .sort('-createdAt');

    res.json({
      success: true,
      count: results.length,
      data: results
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

// @desc    Get result by ID
// @route   GET /api/quizzes/results/:id
// @access  Private
exports.getResultById = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate('quiz');

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Result not found'
      });
    }

    // Check if result belongs to user
    if (result.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this result'
      });
    }

    res.json({
      success: true,
      data: result
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