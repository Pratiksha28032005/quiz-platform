import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const icons = ['✦', '◈', '✺', '◎', '◆', '✹'];

export default function QuizList() {
  const [quizzes, setQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { api.get('/categories').then((res) => setCategories(res.data)).catch(() => {}); }, []);
  useEffect(() => {
    const params = {};
    if (search) params.search = search;
    if (category) params.category = category;
    if (difficulty) params.difficulty = difficulty;
    setError('');
    api.get('/quizzes', { params }).then((res) => setQuizzes(res.data)).catch((err) => setError(err.response?.data?.message || 'Could not load quizzes. Make sure the backend is running on port 5001.'));
  }, [search, category, difficulty]);

  return (
    <main className="page-shell">
      <section className="hero-banner">
        <div className="hero-copy">
          <p className="eyebrow">Your next win starts here</p>
          <h1>Learn something new. Prove what you know.</h1>
          <p>Pick a challenge, sharpen your skills, and keep your streak moving with quick, focused quizzes.</p>
          <a className="btn-coral" href="#quiz-library">Browse the library <span>↓</span></a>
        </div>
        <div className="hero-art" aria-hidden="true"><div className="hero-art-inner">🧠</div></div>
      </section>

      <section id="quiz-library" aria-labelledby="library-title">
        <div className="filter-bar">
          <div className="search-wrap">
            <span>⌕</span>
            <input placeholder="Search your next challenge..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by category">
            <option value="">All categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} aria-label="Filter by difficulty">
            <option value="">All levels</option>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
        </div>

        <div className="panel-heading">
          <div>
            <p className="eyebrow">Curated for you</p>
            <h2 id="library-title" className="section-title">Explore the quiz library</h2>
          </div>
          <span className="muted" style={{ fontSize: '.8rem' }}>{quizzes.length} challenges</span>
        </div>

        {error && <div className="auth-error" style={{ marginBottom: 18 }}>{error}</div>}
        <div className="quiz-grid">
          {quizzes.map((q, index) => (
            <Link to={`/quizzes/${q.id}`} key={q.id} className="quiz-card">
              <div className="quiz-card-top">
                <span className="quiz-icon">{icons[index % icons.length]}</span>
                <span className={`chip ${q.difficulty === 'ADVANCED' ? 'chip-coral' : q.difficulty === 'INTERMEDIATE' ? 'chip-mint' : ''}`}>{q.difficulty}</span>
              </div>
              <h2>{q.title}</h2>
              <p>{q.description || 'A focused challenge to build confidence and see how far you can go.'}</p>
              <div className="quiz-meta">
                <span>◷ {q.duration_minutes} min</span>
                <span>▣ {q.question_count} questions</span>
              </div>
            </Link>
          ))}
        </div>
        {quizzes.length === 0 && <div className="empty-state">No quizzes match those filters yet. Try widening your search.</div>}
      </section>
    </main>
  );
}
