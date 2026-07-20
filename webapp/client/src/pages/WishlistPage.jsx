import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../auth';
import PropertyCard from '../components/PropertyCard';

export default function WishlistPage() {
  const { isAuth, loading } = useAuth();
  const [items, setItems] = useState([]);
  const [ids, setIds] = useState([]);
  const [error, setError] = useState('');

  async function load() {
    const d = await api.wishlist();
    setItems(d.items || []);
    setIds(d.ids || []);
  }

  useEffect(() => {
    if (!isAuth) return;
    load().catch((err) => setError(err.message));
  }, [isAuth]);

  if (loading) return <div className="empty">لوڈ…</div>;
  if (!isAuth) return <Navigate to="/login" replace />;

  async function toggleWish(id) {
    await api.removeWishlist(id);
    await load();
  }

  return (
    <section className="section">
      <div className="container">
        <h1 className="page-title">پسندیدہ پراپرٹیز</h1>
        {error && <div className="alert alert-error">{error}</div>}
        {!items.length ? (
          <div className="empty">
            ابھی کچھ محفوظ نہیں · <Link to="/search">تلاش کریں</Link>
          </div>
        ) : (
          <div className="grid">
            {items.map((p) => (
              <PropertyCard
                key={p.id}
                property={p}
                wished={ids.includes(p.id)}
                onToggleWish={toggleWish}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
