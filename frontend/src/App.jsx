import React from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import QuizList from './pages/QuizList';
import QuizDetails from './pages/QuizDetails';
import QuizAttempt from './pages/QuizAttempt';
import Result from './pages/Result';
import StudentDashboard from './pages/StudentDashboard';
import AttemptHistory from './pages/AttemptHistory';
import Leaderboard from './pages/Leaderboard';

import AdminDashboard from './pages/AdminDashboard';
import ManageQuizzes from './pages/ManageQuizzes';
import ManageQuestions from './pages/ManageQuestions';
import ManageCategories from './pages/ManageCategories';
import ManageUsers from './pages/ManageUsers';

export default function App() {
  return (
    <div className="min-h-screen bg-transparent">
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Student routes */}
        <Route path="/" element={<ProtectedRoute role="STUDENT"><QuizList /></ProtectedRoute>} />
        <Route path="/quizzes/:id" element={<ProtectedRoute role="STUDENT"><QuizDetails /></ProtectedRoute>} />
        <Route path="/quizzes/:id/attempt" element={<ProtectedRoute role="STUDENT"><QuizAttempt /></ProtectedRoute>} />
        <Route path="/results/:id" element={<ProtectedRoute><Result /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute role="STUDENT"><StudentDashboard /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute role="STUDENT"><AttemptHistory /></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />

        {/* Admin routes */}
        <Route path="/admin" element={<ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/quizzes" element={<ProtectedRoute role="ADMIN"><ManageQuizzes /></ProtectedRoute>} />
        <Route path="/admin/quizzes/:quizId/questions" element={<ProtectedRoute role="ADMIN"><ManageQuestions /></ProtectedRoute>} />
        <Route path="/admin/categories" element={<ProtectedRoute role="ADMIN"><ManageCategories /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute role="ADMIN"><ManageUsers /></ProtectedRoute>} />

        {/* Keep direct links/bookmarks from rendering an empty route. */}
        <Route path="*" element={<Navigate to={userHomePath()} replace />} />
      </Routes>
    </div>
  );
}

function userHomePath() {
  try {
    const stored = localStorage.getItem('user');
    return stored && JSON.parse(stored)?.role === 'ADMIN' ? '/admin' : '/login';
  } catch {
    return '/login';
  }
}
