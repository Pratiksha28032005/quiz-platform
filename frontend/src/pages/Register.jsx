import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState('');
  const { register } = useAuth(); const navigate = useNavigate();
  async function handleSubmit(e) {
    e.preventDefault(); setError('');
    try { await register(name, email, password); navigate('/'); } catch (err) { setError(err.response?.data?.message || 'Registration failed'); }
  }
  return <main className="auth-layout"><section className="auth-art"><span className="auth-badge">✦ Make progress visible</span><h1>Turn curiosity into confidence.</h1><p>Join a community of learners who are making a little time for a lot of growth.</p></section><section className="auth-form-wrap"><div className="auth-card"><p className="eyebrow">Start your journey</p><h1>Create account</h1><p className="auth-intro">A better learning rhythm begins here.</p>{error && <p className="auth-error">{error}</p>}<form onSubmit={handleSubmit}><div><label className="field-label" htmlFor="name">Your name</label><input id="name" placeholder="Alex Morgan" value={name} onChange={(e) => setName(e.target.value)} required /></div><div><label className="field-label" htmlFor="register-email">Email address</label><input id="register-email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required /></div><div><label className="field-label" htmlFor="register-password">Create a password</label><input id="register-password" type="password" placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required /></div><button type="submit" className="btn-primary">Create my account <span>→</span></button></form><p className="muted" style={{ fontSize: '.8rem', textAlign: 'center', margin: '20px 0 0' }}>Already learning here? <Link to="/login" style={{ color: 'var(--brand)', fontWeight: 700 }}>Log in</Link></p></div></section></main>;
}
