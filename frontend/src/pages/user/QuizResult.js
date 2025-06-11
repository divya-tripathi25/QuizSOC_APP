import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const QuizResult = () => {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        setError('');
        
        console.log('Fetching result with ID:', id);
        // Check if we are at quiz/results/:id (result ID) or quiz/:id/results (quiz ID)
        const endpoint = window.location.pathname.includes('/quiz/results/') 
          ? `/api/quizzes/results/${id}` 
          : `/api/quizzes/${id}/result`;
        
        console.log('Fetching from endpoint:', endpoint);
        const response = await axios.get(endpoint);
        
        if (response.data && response.data.data) {
          setResult(response.data.data);
        } else {
          setError('Invalid result data format received from server');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching result:', error.response?.data || error);
        setError('Failed to load quiz result. Please try again later.');
        setLoading(false);
      }
    };

    fetchResult();
  }, [id]);

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
        <Link 
          to="/quizzes" 
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
        >
          Return to Quizzes
        </Link>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white shadow-md rounded-lg p-6 text-center">
          <p className="text-xl font-semibold mb-4">No results found. You may not have completed this quiz yet.</p>
          <Link 
            to="/quizzes" 
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
          >
            Return to Quizzes
          </Link>
        </div>
      </div>
    );
  }

  // Extract data from result object based on the structure returned from the API
  const quiz = result.quiz || {};
  const correctAnswers = result.correct_answers || 0;
  const totalQuestions = result.total_questions || 0;
  const score = result.score || 0; // This is already the percentage from the backend
  const detailedResults = result.detailed_results || {};
  const questions = result.questions || [];
  
  // Get time spent from the result, ensuring it's a number
  const timeSpent = detailedResults.time_spent || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6">{quiz.title || 'Quiz'} - Results</h1>

        <div className="mb-8">
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">{score}%</div>
            <div className="text-lg">
              You scored {correctAnswers} out of {totalQuestions} ({score}%)
            </div>
            <div className="text-sm text-gray-500 mt-2">
              Time taken: {timeSpent > 0 ? `${timeSpent} minutes` : 'N/A'}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Question Review</h2>
          
          {questions.map((question, index) => {
            const userAnswer = detailedResults.answers?.find(a => a.question_id === question._id)?.user_answer || 'Not answered';
            const isCorrect = userAnswer === question.correct_answer;
            
            return (
              <div 
                key={question._id} 
                className={`p-4 rounded-lg ${
                  isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}
              >
                <div className="font-medium mb-2">Question {index + 1}: {question.question}</div>
                <div className="mb-1">
                  <span className="font-medium">Your answer:</span> {userAnswer}
                </div>
                {!isCorrect && (
                  <div className="text-green-600">
                    <span className="font-medium">Correct answer:</span> {question.correct_answer}
                  </div>
                )}
                <div className="mt-2 text-gray-600 text-sm">
                  <span className="font-medium">Explanation:</span> {question.explanation || 'No explanation provided'}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex justify-between">
          <Link 
            to="/quizzes" 
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Back to Quizzes
          </Link>
          <Link 
            to="/performance" 
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            View Performance Report
          </Link>
        </div>
      </div>
    </div>
  );
};

export default QuizResult; 