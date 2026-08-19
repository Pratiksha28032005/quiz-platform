import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function AttemptHistory() {
  const [attempts, setAttempts] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => { api.get('/attempts').then((res) => setAttempts(res.data)).catch((err) => setError(err.response?.data?.message || 'Could not load attempt history. Make sure the backend is running on port 5001.')); }, []);
  const completed = attempts.filter((a) => a.status !== 'IN_PROGRESS');
  return <main className="page-narrow">{error && <div className="auth-error" style={{ marginBottom: 18 }}>{error}</div>}<div style={{ marginBottom: 28 }}><p className="eyebrow">Your learning trail</p><h1 className="display-title" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>Attempt history</h1><p className="muted" style={{ margin: '10px 0 0' }}>Look back, spot patterns, and celebrate the progress.</p></div><section className="panel">{completed.map((a) => <Link to={`/results/${a.id}`} key={a.id} className="attempt-row"><div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><span className="quiz-icon" style={{ width: 38, height: 38, fontSize: '1rem' }}>✦</span><div><p style={{ margin: 0, fontWeight: 700, fontSize: '.88rem' }}>{a.quiz_title}</p><p className="muted" style={{ margin: '4px 0 0', fontSize: '.72rem' }}>{new Date(a.started_at).toLocaleDateString()}</p></div></div><span className={`chip ${a.status === 'PASSED' ? 'chip-mint' : 'chip-coral'}`}>{a.percentage}% · {a.status}</span></Link>)}{completed.length === 0 && <div className="empty-state">No attempts yet. Your future self will thank you for starting.</div>}</section></main>;
}
