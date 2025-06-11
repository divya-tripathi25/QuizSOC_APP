import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import jsPDF from 'jspdf';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const QuizAnalytics = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const quizId = queryParams.get('quizId');
  
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState(quizId || '');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQuizzes();
  }, []);

  useEffect(() => {
    if (selectedQuizId) {
      fetchAnalytics(selectedQuizId);
    }
  }, [selectedQuizId]);

  const fetchQuizzes = async () => {
    try {
      const response = await axios.get('/api/admin/quizzes');
      
      // Extract quizzes from response, ensuring we handle the data structure correctly
      const quizzesData = response.data && response.data.success 
        ? (response.data.data || []) 
        : (Array.isArray(response.data) ? response.data : []);
      
      setQuizzes(quizzesData);
      
      if (!quizId && quizzesData.length > 0) {
        setSelectedQuizId(quizzesData[0]._id);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      setError('Failed to fetch quizzes');
      setQuizzes([]);
      setLoading(false);
    }
  };

  const fetchAnalytics = async (id) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/admin/quizzes/${id}/analytics`);
      
      // Handle API response format
      if (response.data && response.data.success) {
        setAnalytics(response.data.data || null);
      } else {
        setAnalytics(response.data || null);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to fetch analytics: ' + (error.response?.data?.message || error.message));
      setAnalytics(null);
      setLoading(false);
    }
  };

  const handleQuizChange = (e) => {
    setSelectedQuizId(e.target.value);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const quiz = Array.isArray(quizzes) ? quizzes.find(q => q && q._id === selectedQuizId) : null;
    
    // Add title
    doc.setFontSize(20);
    doc.text(`Analytics: ${quiz?.title || 'Selected Quiz'}`, 105, 15, { align: 'center' });
    
    // Add timestamp
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 22, { align: 'center' });
    
    // Add data
    if (analytics) {
      doc.setFontSize(12);
      doc.text(`Total Attempts: ${analytics.totalAttempts || 0}`, 20, 35);
      doc.text(`Average Score: ${analytics.averageScore ? analytics.averageScore.toFixed(2) : 0}%`, 20, 45);
      doc.text(`Passing Rate: ${analytics.passingRate ? analytics.passingRate.toFixed(2) : 0}%`, 20, 55);
      doc.text(`Average Time: ${analytics.averageTime ? (analytics.averageTime / 60).toFixed(2) : 0} minutes`, 20, 65);
      
      // Question performance table
      if (analytics.questionPerformance && analytics.questionPerformance.length > 0) {
        doc.text('Question Performance:', 20, 80);
        
        let yPos = 90;
        doc.text('Question', 20, yPos);
        doc.text('Correct Rate', 150, yPos);
        
        yPos += 5;
        doc.line(20, yPos, 180, yPos); // Draw line
        
        analytics.questionPerformance.forEach((question, index) => {
          if (!question) return;
          
          yPos += 10;
          if (yPos > 270) {
            // Add new page if we're running out of space
            doc.addPage();
            yPos = 20;
          }
          const text = question.text || `Question ${index + 1}`;
          const truncatedText = text.length > 50 
            ? text.substring(0, 50) + '...' 
            : text;
          doc.text(`Q${index + 1}: ${truncatedText}`, 20, yPos);
          doc.text(`${question.correctRate ? (question.correctRate * 100).toFixed(2) : 0}%`, 150, yPos);
        });
      }
      
      // Recent attempts
      if (analytics.recentAttempts && analytics.recentAttempts.length > 0) {
        doc.addPage();
        
        doc.text('Recent Attempts:', 20, 20);
        
        let yPos = 30;
        doc.text('User', 20, yPos);
        doc.text('Score', 100, yPos);
        doc.text('Time', 130, yPos);
        doc.text('Date', 160, yPos);
        
        yPos += 5;
        doc.line(20, yPos, 180, yPos); // Draw line
        
        analytics.recentAttempts.forEach((attempt, index) => {
          if (!attempt) return;
          
          yPos += 10;
          
          doc.text(attempt.userName || 'Anonymous', 20, yPos);
          doc.text(`${attempt.score ? attempt.score.toFixed(2) : 0}%`, 100, yPos);
          
          const timeTaken = attempt.timeTaken || 0;
          doc.text(`${Math.floor(timeTaken / 60)}m ${timeTaken % 60}s`, 130, yPos);
          
          const date = attempt.date ? new Date(attempt.date).toLocaleDateString() : 'N/A';
          doc.text(date, 160, yPos);
        });
      }
    }
    
    doc.save(`quiz-analytics-${selectedQuizId}.pdf`);
  };

  if (loading && !analytics) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Prepare data for score distribution chart
  const scoreDistributionData = analytics && analytics.scoreDistribution && 
    Array.isArray(analytics.scoreDistribution) && analytics.scoreDistribution.length === 5 ? {
    labels: ['0-20%', '21-40%', '41-60%', '61-80%', '81-100%'],
    datasets: [
      {
        data: analytics.scoreDistribution,
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(255, 159, 64, 0.5)',
          'rgba(255, 205, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(54, 162, 235, 0.5)',
        ],
        borderWidth: 1,
      },
    ],
  } : null;

  // Prepare data for question performance chart
  const questionPerformanceData = analytics && analytics.questionPerformance && 
    Array.isArray(analytics.questionPerformance) && analytics.questionPerformance.length > 0 ? {
    labels: analytics.questionPerformance.map((q, i) => `Q${i + 1}`),
    datasets: [
      {
        label: 'Correct Answer Rate (%)',
        data: analytics.questionPerformance.map(q => q && q.correctRate ? q.correctRate * 100 : 0),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  } : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Quiz Analytics</h1>
          {analytics && (
            <button 
              onClick={generatePDF}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
            >
              Download PDF
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="quizSelect">
            Select Quiz
          </label>
          <select
            id="quizSelect"
            value={selectedQuizId}
            onChange={handleQuizChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="">-- Select a Quiz --</option>
            {Array.isArray(quizzes) && quizzes.length > 0 ? (
              quizzes.map(quiz => (
                <option key={quiz._id} value={quiz._id}>
                  {quiz.title}
                </option>
              ))
            ) : (
              <option value="" disabled>No quizzes available</option>
            )}
          </select>
        </div>

        {analytics ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-gray-500 text-sm">Total Attempts</div>
                <div className="text-3xl font-bold">{analytics.totalAttempts || 0}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-gray-500 text-sm">Average Score</div>
                <div className="text-3xl font-bold">{analytics.averageScore ? analytics.averageScore.toFixed(2) : '0.00'}%</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-gray-500 text-sm">Passing Rate</div>
                <div className="text-3xl font-bold">{analytics.passingRate ? analytics.passingRate.toFixed(2) : '0.00'}%</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-gray-500 text-sm">Average Time</div>
                <div className="text-3xl font-bold">
                  {analytics.averageTime 
                    ? `${Math.floor(analytics.averageTime / 60)}m ${Math.round(analytics.averageTime % 60)}s` 
                    : '0m 0s'
                  }
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h2 className="text-lg font-semibold mb-4">Score Distribution</h2>
                <div className="h-64">
                  {scoreDistributionData ? (
                    <Pie data={scoreDistributionData} options={{ maintainAspectRatio: false }} />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">No data available</p>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-4">Question Performance</h2>
                <div className="h-64">
                  {questionPerformanceData ? (
                    <Bar 
                      data={questionPerformanceData} 
                      options={{ 
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            max: 100,
                            title: {
                              display: true,
                              text: 'Correct Answer Rate (%)'
                            }
                          }
                        }
                      }} 
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">No data available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Question Details</h2>
              {analytics.questionPerformance && analytics.questionPerformance.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="py-2 px-4 text-left">Question</th>
                        <th className="py-2 px-4 text-center">Correct Rate</th>
                        <th className="py-2 px-4 text-center">Avg. Time (sec)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.questionPerformance.map((question, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                          <td className="py-2 px-4">
                            <div className="font-medium">Q{index + 1}</div>
                            <div className="text-sm text-gray-600">{question?.text || `Question ${index + 1}`}</div>
                          </td>
                          <td className="py-2 px-4 text-center">
                            <span className={`px-2 py-1 rounded ${
                              (question?.correctRate || 0) >= 0.7 ? 'bg-green-100 text-green-800' : 
                              (question?.correctRate || 0) >= 0.4 ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'
                            }`}>
                              {((question?.correctRate || 0) * 100).toFixed(2)}%
                            </span>
                          </td>
                          <td className="py-2 px-4 text-center">{(question?.averageTime || 0).toFixed(1)}s</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-white p-6 rounded-lg shadow text-center">
                  <p className="text-gray-500">No question performance data available</p>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4">Recent Attempts</h2>
              {analytics.recentAttempts && analytics.recentAttempts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="py-2 px-4 text-left">User</th>
                        <th className="py-2 px-4 text-center">Score</th>
                        <th className="py-2 px-4 text-center">Result</th>
                        <th className="py-2 px-4 text-center">Time Taken</th>
                        <th className="py-2 px-4 text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.recentAttempts.map((attempt, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                          <td className="py-2 px-4">{attempt?.userName || 'Anonymous'}</td>
                          <td className="py-2 px-4 text-center">{(attempt?.score || 0).toFixed(2)}%</td>
                          <td className="py-2 px-4 text-center">
                            <span className={`px-2 py-1 rounded text-xs ${
                              (attempt?.score || 0) >= 70 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {(attempt?.score || 0) >= 70 ? 'PASSED' : 'FAILED'}
                            </span>
                          </td>
                          <td className="py-2 px-4 text-center">
                            {attempt?.timeTaken 
                              ? `${Math.floor((attempt.timeTaken || 0) / 60)}m ${(attempt.timeTaken || 0) % 60}s` 
                              : '0m 0s'
                            }
                          </td>
                          <td className="py-2 px-4 text-right">
                            {attempt?.date ? new Date(attempt.date).toLocaleString() : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-white p-6 rounded-lg shadow text-center">
                  <p className="text-gray-500">No recent attempts data available</p>
                </div>
              )}
            </div>
          </>
        ) : selectedQuizId ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
            <p>Loading analytics data...</p>
          </div>
        ) : (
          <div className="text-center py-8">
            <p>Select a quiz to view analytics</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizAnalytics; 