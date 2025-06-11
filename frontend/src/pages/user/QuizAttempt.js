import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const QuizAttempt = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [error, setError] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/quizzes/${id}`);
        console.log('Quiz data:', response.data);
        
        // Check if the data is in the expected format
        if (response.data && response.data.data) {
          setQuiz(response.data.data);
          setTimeLeft(response.data.data.time_limit * 60); // Convert minutes to seconds
          setStartTime(Date.now()); // Set the start time when quiz loads
        } else {
          setError('Invalid quiz data format received from server');
          console.error('Invalid quiz data format:', response.data);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching quiz:', error);
        setError('Failed to load quiz. Please try again later.');
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id]);

  // Update time left and track total time spent
  useEffect(() => {
    if (!timeLeft || !quiz) return;

    const timerId = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerId);
          const timeSpent = Math.floor((Date.now() - startTime) / 1000);
          setTotalTimeSpent(timeSpent);
          handleSubmit(timeSpent);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, quiz, startTime]);

  const handleAnswerSelect = (questionIndex, selectedOption) => {
    setAnswers({
      ...answers,
      [questionIndex]: selectedOption
    });
  };

  const handleNext = () => {
    if (quiz && currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async (timeSpentOverride = null) => {
    try {
      // Calculate time spent in seconds if not provided
      const timeSpent = timeSpentOverride !== null 
        ? timeSpentOverride 
        : Math.floor((Date.now() - startTime) / 1000);
      
      setTotalTimeSpent(timeSpent);
      
      console.log('Submitting quiz with time spent:', timeSpent);

      // Calculate time distribution based on answered questions
      const answeredQuestionCount = Object.keys(answers).length;
      const timePerQuestion = answeredQuestionCount > 0 
        ? Math.floor(timeSpent / answeredQuestionCount) 
        : 0;

      // Format answers for submission with better time tracking
      const formattedAnswers = Object.keys(answers).map(questionIndex => {
        // Calculate a reasonable time estimate for this question
        // For simplicity, we distribute time evenly across all answered questions
        return {
          questionId: quiz.questions[questionIndex]._id,
          answer: answers[questionIndex],
          timeTaken: timePerQuestion // Assign even distribution of time to each question
        };
      });

      // Ensure we have at least one answer before submission
      if (formattedAnswers.length === 0) {
        setError('Please answer at least one question before submitting.');
        return;
      }

      const response = await axios.post(`/api/quizzes/${id}/submit`, {
        answers: formattedAnswers,
        timeSpent: timeSpent
      });

      console.log('Submission response:', response.data);
      
      // Navigate to results page with the correct path
      if (response.data && response.data.data && response.data.data._id) {
        navigate(`/quiz/results/${response.data.data._id}`);
      } else {
        // If no result ID, go back to the quizzes list
        navigate('/quizzes');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error.response?.data || error);
      setError('Failed to submit quiz. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button 
          onClick={() => navigate('/quizzes')} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
        >
          Return to Quizzes
        </button>
      </div>
    );
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white shadow-md rounded-lg p-6 text-center">
          <p className="text-xl font-semibold mb-4">Quiz not found or has no questions</p>
          <button 
            onClick={() => navigate('/quizzes')} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
          >
            Return to Quizzes
          </button>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];

  if (!question) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white shadow-md rounded-lg p-6 text-center">
          <p className="text-xl font-semibold mb-4">Question not found</p>
          <button 
            onClick={() => navigate('/quizzes')} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
          >
            Return to Quizzes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{quiz.title}</h1>
          <div className="text-lg font-semibold">
            Time Left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
        </div>

        <div className="mb-6">
          <div className="text-sm text-gray-500 mb-2">
            Question {currentQuestion + 1} of {quiz.questions.length}
          </div>
          <h2 className="text-xl font-semibold mb-4">{question.question}</h2>

          <div className="space-y-3">
            {question.options && question.options.map((option, index) => (
              <div key={index} className="flex items-center">
                <input
                  type="radio"
                  id={`option-${index}`}
                  name={`question-${currentQuestion}`}
                  checked={answers[currentQuestion] === option}
                  onChange={() => handleAnswerSelect(currentQuestion, option)}
                  className="mr-3"
                />
                <label htmlFor={`option-${index}`}>{option}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded disabled:opacity-50"
          >
            Previous
          </button>
          
          {currentQuestion < quiz.questions.length - 1 ? (
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-indigo-600 text-white rounded"
            >
              Next
            </button>
          ) : (
            <button
              onClick={() => handleSubmit()}
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              Submit Quiz
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizAttempt; 