import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function StudentDashboard() {
  const [attempts, setAttempts] = useState([]);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => { api.get('/attempts').then((res) => setAttempts(res.data)).catch((err) => setError(err.response?.data?.message || 'Could not load your progress. Make sure the backend is running on port 5001.')); }, []);

  const completed = attempts.filter((a) => a.status !== 'IN_PROGRESS');
  const passed = completed.filter((a) => a.status === 'PASSED').length;
  const avgScore = completed.length ? Math.round(completed.reduce((sum, a) => sum + Number(a.percentage), 0) / completed.length) : 0;
  const highScore = completed.length ? Math.max(...completed.map((a) => Number(a.percentage))) : 0;

  return (
    <main className="page-shell">
      {error && <div className="auth-error" style={{ marginBottom: 18 }}>{error}</div>}
      <section className="hero-banner" style={{ minHeight: 205, marginBottom: 24 }}>
        <div className="hero-copy">
          <p className="eyebrow">Welcome back, {user?.name?.split(' ')[0] || 'learner'}</p>
          <h1>Your progress has a pulse.</h1>
          <p>Every attempt is a small step forward. Keep exploring and make your next score your best one yet.</p>
        </div>
        <div className="hero-art" aria-hidden="true"><div className="hero-art-inner">🚀</div></div>
      </section>

      <div className="stats-grid">
        <Stat icon="◉" label="Quizzes completed" value={completed.length} />
        <Stat icon="↗" label="Average score" value={`${avgScore}%`} />
        <Stat icon="★" label="Personal best" value={`${highScore}%`} />
        <Stat icon="✓" label="Passed" value={passed} tone="mint" />
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-heading">
            <div><p className="eyebrow">Keep the momentum</p><h2 className="section-title">Recent attempts</h2></div>
            <Link to="/history" className="chip">View all →</Link>
          </div>
          {completed.slice(0, 5).map((a) => (
            <Link to={`/results/${a.id}`} className="attempt-row" key={a.id}>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '.9rem' }}>{a.quiz_title}</p>
                <p className="muted" style={{ margin: '4px 0 0', fontSize: '.74rem' }}>{new Date(a.started_at).toLocaleDateString()}</p>
              </div>
              <strong style={{ color: a.status === 'PASSED' ? 'var(--mint)' : 'var(--coral)', fontSize: '.9rem' }}>{a.percentage}%</strong>
            </Link>
          ))}
          {completed.length === 0 && <div className="empty-state">Your first challenge is waiting in the library.</div>}
        </section>

        <section className="panel">
          <div className="panel-heading"><div><p className="eyebrow">A little ritual</p><h2 className="section-title">Your rhythm</h2></div><span style={{ fontSize: '1.5rem' }}>◒</span></div>
          <p className="muted" style={{ fontSize: '.82rem', lineHeight: 1.6 }}>You’re building a habit one focused quiz at a time.</p>
          <div style={{ margin: '22px 0 8px', display: 'flex', justifyContent: 'space-between', fontSize: '.75rem', fontWeight: 700 }}><span>Weekly goal</span><span style={{ color: 'var(--brand)' }}>{Math.min(completed.length, 5)} / 5</span></div>
          <div className="progress-track"><div className="progress-fill" style={{ width: `${Math.min(completed.length / 5 * 100, 100)}%` }} /></div>
          <Link to="/" className="btn-primary" style={{ width: '100%', marginTop: 25 }}>Find a new challenge <span>→</span></Link>
        </section>
      </div>
    </main>
  );
}

function Stat({ icon, label, value, tone }) {
  return <div className="stat-card"><span className="stat-icon" style={tone === 'mint' ? { color: 'var(--mint)', background: '#dcf7ef' } : undefined}>{icon}</span><p className="stat-label">{label}</p><p className="stat-value">{value}</p></div>;
}
