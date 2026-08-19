import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="app-nav">
      <Link to={user?.role === 'ADMIN' ? '/admin' : '/'} className="brand-lockup">
        <span className="brand-mark">✦</span>
        <span className="brand-name">Quiz<span>ly</span></span>
      </Link>
      <div className="nav-links">
        {user?.role === 'STUDENT' && (
          <>
            <NavLink to="/" active={location.pathname === '/'}>Explore</NavLink>
            <NavLink to="/dashboard" active={location.pathname === '/dashboard'}>Dashboard</NavLink>
            <NavLink to="/history" active={location.pathname === '/history'}>History</NavLink>
            <NavLink to="/leaderboard" active={location.pathname === '/leaderboard'}>Leaderboard</NavLink>
          </>
        )}
        {user?.role === 'ADMIN' && (
          <>
            <NavLink to="/admin" active={location.pathname === '/admin'}>Overview</NavLink>
            <NavLink to="/admin/quizzes" active={location.pathname.startsWith('/admin/quizzes')}>Quizzes</NavLink>
            <NavLink to="/admin/categories" active={location.pathname === '/admin/categories'}>Categories</NavLink>
            <NavLink to="/admin/users" active={location.pathname === '/admin/users'}>Students</NavLink>
          </>
        )}
        {user ? (
          <div className="nav-profile">
            <span className="nav-avatar">{user.name?.charAt(0).toUpperCase()}</span>
            <span className="nav-user-name">{user.name}</span>
            <button onClick={handleLogout} className="nav-logout">Log out</button>
          </div>
        ) : (
          <div className="nav-profile">
            <Link to="/login" className="nav-link">Log in</Link>
            <Link to="/register" className="btn-coral">Get started</Link>
          </div>
        )}
      </div>
    </nav>
  );
}

function NavLink({ to, active, children }) {
  return <Link to={to} className={`nav-link ${active ? 'active' : ''}`}>{children}</Link>;
}
