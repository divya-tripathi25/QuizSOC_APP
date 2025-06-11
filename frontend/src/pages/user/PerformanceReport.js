import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import jsPDF from 'jspdf';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const PerformanceReport = () => {
  const [performanceData, setPerformanceData] = useState({
    totalQuizzesAttempted: 0,
    averageScore: 0,
    bestScore: 0,
    totalTimeSpent: 0,
    categoryPerformance: [],
    recentQuizzes: []
  });
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/users/performance');
        console.log('Performance data:', response.data);
        
        if (response.data && response.data.success) {
          // Process performance data from the API response
          const categoryData = response.data.data || {};
          const categoryNames = Object.keys(categoryData);
          
          // Format category performance data
          const categoryPerformance = categoryNames.map(name => ({
            name: name,
            count: categoryData[name].attempts || 0,
            averageScore: categoryData[name].averageScore || 0,
            timeSpent: 0 // We'll calculate this from quiz history
          }));
          
          // Calculate overall metrics
          const totalQuizzes = categoryPerformance.reduce((total, cat) => total + cat.count, 0);
          const weightedScoreSum = categoryPerformance.reduce((sum, cat) => sum + (cat.averageScore * cat.count), 0);
          const averageScore = totalQuizzes > 0 ? weightedScoreSum / totalQuizzes : 0;
          const bestScore = Math.max(...categoryPerformance.map(cat => cat.averageScore), 0);
          let totalTimeSpent = 0;
          
          // Get recent quiz results and calculate time spent
          let recentQuizzes = [];
          try {
            const historyResponse = await axios.get('/api/users/quiz-history');
            console.log('Quiz history data:', historyResponse.data);
            
            if (historyResponse.data && historyResponse.data.success) {
              // Process quiz history
              const quizHistory = historyResponse.data.data || [];
              
              // Calculate time spent by category
              quizHistory.forEach(item => {
                if (item.result && item.result.detailed_results) {
                  const quizTitle = item.quiz?.title;
                  const timeSpent = item.result.detailed_results.time_spent || 0;
                  
                  // Add to category time spent
                  const categoryIndex = categoryPerformance.findIndex(cat => cat.name === quizTitle);
                  if (categoryIndex >= 0) {
                    categoryPerformance[categoryIndex].timeSpent += timeSpent;
                  }
                  
                  // Add to total time spent
                  totalTimeSpent += timeSpent;
                }
              });
              
              // Get the 5 most recent quizzes
              recentQuizzes = quizHistory.slice(0, 5).map(item => {
                // Extract time spent, handling different data structures
                let timeTaken = 0;
                if (item.result && item.result.detailed_results) {
                  // Get time_spent directly (already stored in minutes in the database)
                  // Then convert to seconds for display
                  timeTaken = parseFloat(item.result.detailed_results.time_spent || 0) * 60;
                }
                
                return {
                  title: item.quiz?.title || 'Unknown Quiz',
                  score: item.result?.score || 0,
                  date: item.result?.createdAt || item.completedAt,
                  category: 'Quiz',
                  timeTaken: timeTaken
                };
              });
            }
          } catch (error) {
            console.error('Error fetching quiz history:', error);
          }
          
          // Set processed data to state
          setPerformanceData({
            totalQuizzesAttempted: totalQuizzes,
            averageScore: averageScore,
            bestScore: bestScore,
            totalTimeSpent: totalTimeSpent,
            categoryPerformance: categoryPerformance,
            recentQuizzes: recentQuizzes
          });
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching performance data:', error);
        setLoading(false);
      }
    };

    fetchPerformanceData();
  }, []);

  const generatePDF = () => {
    setIsGenerating(true);
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Quiz Performance Report', 105, 20, { align: 'center' });
    
    // Add username
    doc.setFontSize(12);
    const user = JSON.parse(localStorage.getItem('user')) || { name: 'User' };
    doc.text(`Name: ${user.name}`, 20, 40);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 50);
    
    // Add overall stats
    doc.setFontSize(16);
    doc.text('Overall Performance', 20, 70);
    doc.setFontSize(12);
    
    const overallStats = [
      `Total Quizzes Taken: ${performanceData.totalQuizzesAttempted || 0}`,
      `Average Score: ${(performanceData.averageScore || 0).toFixed(1)}%`,
      `Best Score: ${(performanceData.bestScore || 0).toFixed(1)}%`,
      `Time Spent: ${((performanceData.totalTimeSpent || 0) / 60).toFixed(1)} minutes`
    ];
    
    let currentYPos = 90;
    overallStats.forEach(stat => {
      doc.text(stat, 30, currentYPos);
      currentYPos += 10;
    });
    
    // Add category performance
    doc.setFontSize(16);
    currentYPos += 10;
    doc.text('Performance by Category', 20, currentYPos);
    doc.setFontSize(12);
    currentYPos += 10;
    
    const categoryPerformance = performanceData.categoryPerformance || [];
    if (categoryPerformance.length > 0) {
      const headers = ['Category', 'Quizzes Taken', 'Avg. Score', 'Time Spent'];
      const cellWidth = 40;
      
      // Create header row
      headers.forEach((header, i) => {
        doc.text(header, 20 + i * cellWidth, currentYPos);
      });
      currentYPos += 10;
      
      // Add category data
      categoryPerformance.forEach(category => {
        doc.text(category.name || 'Unknown', 20, currentYPos);
        doc.text(`${category.count || 0}`, 20 + cellWidth, currentYPos);
        doc.text(`${(category.averageScore || 0).toFixed(1)}%`, 20 + cellWidth * 2, currentYPos);
        doc.text(`${(category.timeSpent || 0).toFixed(1)} min`, 20 + cellWidth * 3, currentYPos);
        currentYPos += 10;
      });
    } else {
      doc.text('No category data available', 30, currentYPos);
      currentYPos += 10;
    }
    
    // Add recent quizzes
    currentYPos += 10;
    doc.setFontSize(16);
    doc.text('Recent Quizzes', 20, currentYPos);
    doc.setFontSize(12);
    currentYPos += 10;
    
    const recentQuizzes = performanceData.recentQuizzes || [];
    if (recentQuizzes.length > 0) {
      const headers = ['Quiz', 'Date', 'Score', 'Time Spent'];
      const cellWidth = 40;
      
      // Create header row
      headers.forEach((header, i) => {
        doc.text(header, 20 + i * cellWidth, currentYPos);
      });
      currentYPos += 10;
      
      // Add quiz data
      recentQuizzes.forEach(quiz => {
        const quizName = quiz.title || 'Unknown Quiz';
        const date = quiz.date ? new Date(quiz.date).toLocaleDateString() : 'Unknown';
        const score = quiz.score !== undefined ? `${(quiz.score || 0).toFixed(1)}%` : 'N/A';
        
        // Format time in minutes and seconds
        let timeSpent = 'N/A';
        if (quiz.timeTaken !== undefined && quiz.timeTaken > 0) {
          const minutes = Math.floor(quiz.timeTaken / 60);
          const seconds = Math.round(quiz.timeTaken % 60);
          timeSpent = `${minutes}m ${seconds}s`;
        }
        
        doc.text(quizName.length > 15 ? quizName.substring(0, 15) + '...' : quizName, 20, currentYPos);
        doc.text(date, 20 + cellWidth, currentYPos);
        doc.text(score, 20 + cellWidth * 2, currentYPos);
        doc.text(timeSpent, 20 + cellWidth * 3, currentYPos);
        currentYPos += 10;
      });
    } else {
      doc.text('No recent quiz data available', 30, currentYPos);
    }
    
    // Save the PDF
    doc.save('performance-report.pdf');
    setIsGenerating(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!performanceData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white shadow-md rounded-lg p-6 text-center">
          <h1 className="text-2xl font-bold mb-4">No Performance Data Available</h1>
          <p>You haven't attempted any quizzes yet. Try some quizzes to see your performance metrics.</p>
        </div>
      </div>
    );
  }

  // Prepare data for pie chart
  const pieData = {
    labels: performanceData.categoryPerformance?.map(cat => cat.name) || [],
    datasets: [
      {
        data: performanceData.categoryPerformance?.map(cat => cat.count) || [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for bar chart
  const barData = {
    labels: performanceData.categoryPerformance?.map(cat => cat.name) || [],
    datasets: [
      {
        label: 'Average Score (%)',
        data: performanceData.categoryPerformance?.map(cat => cat.averageScore) || [],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Your Performance Report</h1>
          <button 
            onClick={generatePDF}
            disabled={isGenerating}
            className={`bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isGenerating ? 'Generating...' : 'Download PDF'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Overview</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Quizzes Attempted:</span>
                <span className="font-medium">{performanceData.totalQuizzesAttempted || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Average Score:</span>
                <span className="font-medium">{(performanceData.averageScore || 0).toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Best Score:</span>
                <span className="font-medium">{(performanceData.bestScore || 0).toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Total Time Spent:</span>
                <span className="font-medium">{((performanceData.totalTimeSpent || 0) / 60).toFixed(2)} minutes</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Quiz Distribution</h2>
            <div className="h-48">
              {performanceData.categoryPerformance && performanceData.categoryPerformance.length > 0 ? (
                <Pie data={pieData} options={{ maintainAspectRatio: false }} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No category data available
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Category Performance</h2>
          <div className="h-64">
            {performanceData.categoryPerformance && performanceData.categoryPerformance.length > 0 ? (
              <Bar 
                data={barData} 
                options={{ 
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100
                    }
                  }
                }} 
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No category data available
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Recent Quiz Results</h2>
          {performanceData.recentQuizzes && performanceData.recentQuizzes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 text-left">Quiz Title</th>
                    <th className="py-2 px-4 text-center">Category</th>
                    <th className="py-2 px-4 text-center">Score</th>
                    <th className="py-2 px-4 text-center">Time Taken</th>
                    <th className="py-2 px-4 text-right">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {performanceData.recentQuizzes.map((quiz, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                      <td className="py-2 px-4">{quiz.title || 'Unnamed Quiz'}</td>
                      <td className="py-2 px-4 text-center">{quiz.category || 'Uncategorized'}</td>
                      <td className="py-2 px-4 text-center">{(quiz.score || 0).toFixed(2)}%</td>
                      <td className="py-2 px-4 text-center">
                        {quiz.timeTaken && quiz.timeTaken > 0
                          ? `${Math.floor(quiz.timeTaken / 60)}m ${Math.round(quiz.timeTaken % 60)}s` 
                          : 'N/A'}
                      </td>
                      <td className="py-2 px-4 text-right">
                        {quiz.date ? new Date(quiz.date).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              No recent quiz results available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerformanceReport; 