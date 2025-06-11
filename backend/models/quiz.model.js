const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: {
    type: [String],
    required: true
  },
  correct_answer: {
    type: String,
    required: true
  },
  explanation: {
    type: String,
    required: true
  }
});

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      enum: ['Numerical Reasoning', 'Verbal Reasoning', 'Mechanical Aptitude', 'Logical Reasoning']
    },
    description: {
      type: String,
      required: true
    },
    time_limit: {
      type: Number,
      default: 45, // 45 minutes
      required: true
    },
    questions: [questionSchema],
    is_active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz; 