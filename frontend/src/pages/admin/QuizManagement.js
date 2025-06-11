import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const QuizManagement = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/quizzes');
      if (response.data && response.data.data) {
        setQuizzes(response.data.data);
      } else {
        console.error('Unexpected API response format:', response.data);
        setQuizzes([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch quizzes:', error);
      setError('Failed to fetch quizzes');
      setQuizzes([]);
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredQuizzes = quizzes.filter(quiz => {
    return quiz.title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const openDeleteModal = (quiz) => {
    setSelectedQuiz(quiz);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedQuiz(null);
  };

  const handleDeleteQuiz = async () => {
    try {
      await axios.delete(`/api/admin/quizzes/${selectedQuiz._id}`);
      fetchQuizzes();
      closeDeleteModal();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete quiz');
    }
  };

  const toggleQuizStatus = async (quizId, isActive) => {
    try {
      await axios.patch(`/api/admin/quizzes/${quizId}/status`, { is_active: !isActive });
      fetchQuizzes();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update quiz status');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Quiz Management</h1>
          <Link 
            to="/admin/quizzes/new" 
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
          >
            Create New Quiz
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search quizzes..."
            value={searchTerm}
            onChange={handleSearch}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 text-left">Title</th>
                <th className="py-2 px-4 text-center">Questions</th>
                <th className="py-2 px-4 text-center">Time Limit</th>
                <th className="py-2 px-4 text-center">Status</th>
                <th className="py-2 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuizzes.map((quiz) => (
                <tr key={quiz._id} className="border-b">
                  <td className="py-2 px-4">{quiz.title}</td>
                  <td className="py-2 px-4 text-center">{quiz.questions ? quiz.questions.length : 0}</td>
                  <td className="py-2 px-4 text-center">{quiz.time_limit} mins</td>
                  <td className="py-2 px-4 text-center">
                    <button
                      onClick={() => toggleQuizStatus(quiz._id, quiz.is_active)}
                      className={`px-2 py-1 rounded text-xs ${
                        quiz.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {quiz.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="py-2 px-4 text-center flex justify-center space-x-2">
                    <Link 
                      to={`/admin/quizzes/${quiz._id}/edit`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => openDeleteModal(quiz)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                    <Link 
                      to={`/admin/analytics?quizId=${quiz._id}`}
                      className="text-green-600 hover:text-green-900"
                    >
                      Stats
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredQuizzes.length === 0 && (
          <div className="text-center py-4">
            No quizzes found matching your criteria.
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
            <p className="mb-6">
              Are you sure you want to delete the quiz <span className="font-semibold">{selectedQuiz.title}</span>? 
              This will also delete all associated questions and results. This action cannot be undone.
            </p>
            <div className="flex justify-end">
              <button
                onClick={closeDeleteModal}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteQuiz}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizManagement; 