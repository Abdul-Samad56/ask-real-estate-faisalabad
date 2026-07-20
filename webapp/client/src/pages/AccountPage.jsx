import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../auth';
import { PURPOSE_LABELS, TYPE_LABELS, formatPrice } from '../constants';

const STATUS = {
  pending: 'زیرِ جائزہ',
  reviewed: 'دیکھی گئی',
  converted: 'شائع',
  rejected: 'مسترد',
};

export default function AccountPage() {
  const { user, loading, isAuth, logout } = useAuth();
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuth) return;
    api
      .mySubmissions()
      .then((d) => setItems(d.items || []))
      .catch((err) => setError(err.message));
  }, [isAuth]);

  if (loading) return <div className="empty">لوڈ…</div>;
  if (!isAuth) return <Navigate to="/login" replace />;

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 800 }}>
        <h1 className="page-title">میرا اکاؤنٹ</h1>
        <div className="panel" style={{ marginBottom: '1.25rem' }}>
          <p>
            <strong>{user.name}</strong>
            <br />
            {user.email}
            {user.phone ? (
              <>
                <br />
                {user.phone}
              </>
            ) : null}
            <br />
            <span className="muted">رول: {user.role}</span>
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Link className="btn" to="/list-property">
              نئی پراپرٹی
            </Link>
            <button type="button" className="btn btn-ghost" onClick={logout}>
              لاگ آؤٹ
            </button>
          </div>
        </div>

        <h2>میری سبمشنز</h2>
        {error && <div className="alert alert-error">{error}</div>}
        {!items.length ? (
          <div className="empty">ابھی کوئی سبمشن نہیں</div>
        ) : (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {items.map((s) => (
              <div key={s.id} className="panel">
                <strong>{s.title}</strong>
                <p className="muted" style={{ margin: '0.35rem 0' }}>
                  {PURPOSE_LABELS[s.purpose]} · {TYPE_LABELS[s.type]} · {formatPrice(s.price)}
                  {s.purpose === 'rent' ? ' / ماہ' : ''}
                </p>
                <span className="tag tag-sale">{STATUS[s.status] || s.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
