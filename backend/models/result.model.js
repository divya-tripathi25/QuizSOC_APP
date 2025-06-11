const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true
    },
    score: {
      type: Number,
      required: true
    },
    total_questions: {
      type: Number,
      required: true
    },
    correct_answers: {
      type: Number,
      required: true
    },
    detailed_results: {
      accuracy: {
        type: String,
        required: true
      },
      speed: {
        type: String,
        required: true
      },
      time_spent: {
        type: Number, // in minutes
        required: true
      },
      answers: [
        {
          question_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
          },
          user_answer: {
            type: String
          },
          is_correct: {
            type: Boolean,
            required: true
          },
          time_taken: {
            type: Number, // in seconds
            required: true
          }
        }
      ]
    }
  },
  {
    timestamps: true
  }
);

const Result = mongoose.model('Result', resultSchema);

module.exports = Result; 