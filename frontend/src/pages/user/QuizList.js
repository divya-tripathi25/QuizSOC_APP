import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Layout from '../../components/Layout';

const QuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await axios.get('/api/quizzes');
        
        if (response.data.success) {
          setQuizzes(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching quizzes:', error);
        setError('Failed to load quizzes');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  // Function to get the appropriate badge color based on quiz type
  const getQuizBadgeColor = (title) => {
    switch (title) {
      case 'Numerical Reasoning':
        return 'bg-blue-100 text-blue-800';
      case 'Verbal Reasoning':
        return 'bg-green-100 text-green-800';
      case 'Mechanical Aptitude':
        return 'bg-yellow-100 text-yellow-800';
      case 'Logical Reasoning':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900">Available Quizzes</h1>
            <p className="mt-4 text-lg text-gray-600">
              Choose a quiz category to test your skills and track your progress.
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mt-8 max-w-3xl mx-auto">
              <div className="bg-red-50 text-red-800 rounded-lg shadow-md p-6">
                {error}
              </div>
            </div>
          )}

          {/* Quiz Grid */}
          <div className="mt-12 max-w-lg mx-auto grid gap-5 lg:grid-cols-2 lg:max-w-none">
            {quizzes.length > 0 ? (
              quizzes.map((quiz) => (
                <div key={quiz._id} className="flex flex-col rounded-lg shadow-lg overflow-hidden bg-white hover:shadow-xl transition-shadow duration-300">
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div className="flex-1">
                      <div className="block mt-2">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-3 ${getQuizBadgeColor(quiz.title)}`}>
                          {quiz.title}
                        </div>
                        <p className="text-xl font-semibold text-gray-900">
                          {quiz.title} Quiz
                        </p>
                        <p className="mt-3 text-base text-gray-500">
                          {quiz.description}
                        </p>
                      </div>
                    </div>
                    <div className="mt-6 flex items-center">
                      <div className="flex-shrink-0">
                        <span className="sr-only">Quiz info</span>
                        <div className="text-sm text-gray-500">
                          <p>25 questions • {quiz.time_limit} minutes</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-6 py-4">
                    <Link 
                      to={`/quiz/${quiz._id}`}
                      className="block w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                    >
                      Start Quiz
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 flex items-center justify-center p-8 bg-white rounded-lg shadow">
                <p className="text-gray-500">No quizzes available at the moment. Please check back later.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default QuizList; 