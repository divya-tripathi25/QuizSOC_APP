import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout components
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Public pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// User pages
import UserDashboard from './pages/user/Dashboard';
import QuizList from './pages/user/QuizList';
import QuizAttempt from './pages/user/QuizAttempt';
import QuizResult from './pages/user/QuizResult';
import UserProfile from './pages/user/Profile';
import PerformanceReport from './pages/user/PerformanceReport';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import QuizManagement from './pages/admin/QuizManagement';
import CreateQuiz from './pages/admin/CreateQuiz';
import EditQuiz from './pages/admin/EditQuiz';
import QuizAnalytics from './pages/admin/QuizAnalytics';

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* User routes */}
      <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
      <Route path="/quizzes" element={<ProtectedRoute><QuizList /></ProtectedRoute>} />
      <Route path="/quiz/:id" element={<ProtectedRoute><QuizAttempt /></ProtectedRoute>} />
      <Route path="/quiz/:id/results" element={<ProtectedRoute><QuizResult /></ProtectedRoute>} />
      <Route path="/quiz/results/:id" element={<ProtectedRoute><QuizResult /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
      <Route path="/performance" element={<ProtectedRoute><PerformanceReport /></ProtectedRoute>} />

      {/* Admin routes */}
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><UserManagement /></AdminRoute>} />
      <Route path="/admin/quizzes" element={<AdminRoute><QuizManagement /></AdminRoute>} />
      <Route path="/admin/quizzes/new" element={<AdminRoute><CreateQuiz /></AdminRoute>} />
      <Route path="/admin/quizzes/:id/edit" element={<AdminRoute><EditQuiz /></AdminRoute>} />
      <Route path="/admin/analytics" element={<AdminRoute><QuizAnalytics /></AdminRoute>} />
    </Routes>
  );
}

export default App; 