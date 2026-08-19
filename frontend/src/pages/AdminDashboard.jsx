import React, { useEffect, useState } from 'react';
import api from '../api/axios';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/admin/stats').then((res) => setStats(res.data));
  }, []);

  if (!stats) return <p className="text-center mt-10">Loading...</p>;

  const items = [
    ['Total Students', stats.total_students],
    ['Total Quizzes', stats.total_quizzes],
    ['Published Quizzes', stats.published_quizzes],
    ['Draft Quizzes', stats.draft_quizzes],
    ['Total Questions', stats.total_questions],
    ['Total Attempts', stats.total_attempts],
    ['Average Score', `${stats.average_score}%`],
    ['Passed', stats.total_passed],
    ['Failed', stats.total_failed],
  ];

  return (
    <main className="page-shell">
      <section className="hero-banner" style={{ minHeight: 205, marginBottom: 24 }}>
        <div className="hero-copy">
          <p className="eyebrow">Command center</p>
          <h1>Make every quiz count.</h1>
          <p>Keep a clear view of your content, learners, and the momentum building across the platform.</p>
        </div>
        <div className="hero-art" aria-hidden="true"><div className="hero-art-inner">✦</div></div>
      </section>
      <div className="stats-grid">
        {items.map(([label, value], index) => <div key={label} className="stat-card"><span className="stat-icon">{['◉', '▣', '✓', '◌', '◇', '↗', '◒', '★', '×'][index]}</span><p className="stat-label">{label}</p><p className="stat-value">{value}</p></div>)}
      </div>
    </main>
  );
}
