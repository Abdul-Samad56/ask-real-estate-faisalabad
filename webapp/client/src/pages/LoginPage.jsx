import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';

export default function LoginPage() {
  const { login, register, isAuth } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (isAuth) {
    return <Navigate to="/account" replace />;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register(form);
      }
      navigate('/account');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="section">
      <div className="container auth-box panel">
        <h1 className="page-title">اکاؤنٹ</h1>
        <div className="tabs">
          <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>
            لاگ اِن
          </button>
          <button
            type="button"
            className={mode === 'register' ? 'active' : ''}
            onClick={() => setMode('register')}
          >
            رجسٹر
          </button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form className="form-grid" onSubmit={onSubmit} style={{ gridTemplateColumns: '1fr' }}>
          {mode === 'register' && (
            <>
              <div className="field">
                <label>نام</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="field">
                <label>فون</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </>
          )}
          <div className="field">
            <label>ای میل</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="field">
            <label>پاس ورڈ</label>
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <button className="btn" type="submit" disabled={busy}>
            {busy ? '…' : mode === 'login' ? 'لاگ اِن' : 'رجسٹر'}
          </button>
        </form>
        <p className="muted" style={{ marginTop: '1rem' }}>
          <Link to="/list-property">پراپرٹی لسٹ کرنے</Link> کے لیے اکاؤنٹ بنائیں
        </p>
      </div>
    </section>
  );
}
