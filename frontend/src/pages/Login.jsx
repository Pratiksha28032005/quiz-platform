import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault(); setError('');
    try { const user = await login(email, password); navigate(user.role === 'ADMIN' ? '/admin' : '/'); }
    catch (err) { setError(err.response?.data?.message || 'Login failed'); }
  }

  return <AuthLayout title="Welcome back." subtitle="Your next breakthrough is only a few questions away.">
    <div className="auth-card">
      <p className="eyebrow">Good to see you</p><h1>Log in</h1><p className="auth-intro">Pick up where you left off.</p>
      {error && <p className="auth-error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div><label className="field-label" htmlFor="email">Email address</label><input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
        <div><label className="field-label" htmlFor="password">Password</label><input id="password" type="password" placeholder="Your password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
        <button type="submit" className="btn-primary">Continue <span>→</span></button>
      </form>
      <p className="muted" style={{ fontSize: '.8rem', textAlign: 'center', margin: '20px 0 0' }}>New here? <Link to="/register" style={{ color: 'var(--brand)', fontWeight: 700 }}>Create an account</Link></p>
      <p className="muted" style={{ fontSize: '.7rem', textAlign: 'center', margin: '16px 0 0' }}>Admin demo: admin@quizplatform.com / Admin@123</p>
    </div>
  </AuthLayout>;
}

function AuthLayout({ title, subtitle, children }) {
  return <main className="auth-layout"><section className="auth-art"><span className="auth-badge">✦ Learn at your pace</span><h1>{title}</h1><p>{subtitle}</p></section><section className="auth-form-wrap">{children}</section></main>;
}
