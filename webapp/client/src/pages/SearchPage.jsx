import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api';
import PropertyCard from '../components/PropertyCard';
import { AREAS, TYPE_LABELS } from '../constants';
import { useAuth } from '../auth';

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const { isAuth } = useAuth();
  const [data, setData] = useState({ items: [], total: 0, pages: 1 });
  const [wishIds, setWishIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const filters = {
    purpose: params.get('purpose') || '',
    type: params.get('type') || '',
    area: params.get('area') || '',
    q: params.get('q') || '',
    sort: params.get('sort') || 'newest',
    page: params.get('page') || '1',
  };

  useEffect(() => {
    setLoading(true);
    api
      .properties(filters)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [params.toString()]);

  useEffect(() => {
    if (!isAuth) return;
    api.wishlist().then((d) => setWishIds(d.ids || [])).catch(() => {});
  }, [isAuth]);

  function update(key, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next);
  }

  async function toggleWish(id) {
    if (!isAuth) {
      alert('پسندیدہ کے لیے لاگ اِن کریں');
      return;
    }
    if (wishIds.includes(id)) {
      const d = await api.removeWishlist(id);
      setWishIds(d.ids || []);
    } else {
      const d = await api.addWishlist(id);
      setWishIds(d.ids || []);
    }
  }

  return (
    <section className="section">
      <div className="container">
        <h1 className="page-title">پراپرٹی تلاش</h1>
        <div className="filters">
          <div className="field">
            <label>مقصد</label>
            <select value={filters.purpose} onChange={(e) => update('purpose', e.target.value)}>
              <option value="">سب</option>
              <option value="sale">فروخت</option>
              <option value="rent">کرایہ</option>
            </select>
          </div>
          <div className="field">
            <label>قسم</label>
            <select value={filters.type} onChange={(e) => update('type', e.target.value)}>
              <option value="">سب</option>
              {Object.entries(TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>علاقہ</label>
            <select value={filters.area} onChange={(e) => update('area', e.target.value)}>
              <option value="">سب</option>
              {AREAS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>ترتیب</label>
            <select value={filters.sort} onChange={(e) => update('sort', e.target.value)}>
              <option value="newest">نیا پہلے</option>
              <option value="price_asc">قیمت ↑</option>
              <option value="price_desc">قیمت ↓</option>
            </select>
          </div>
          <div className="field">
            <label>تلاش</label>
            <input
              value={filters.q}
              onChange={(e) => update('q', e.target.value)}
              placeholder="الفاظ…"
            />
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {loading ? (
          <div className="empty">لوڈ ہو رہا ہے…</div>
        ) : data.items.length === 0 ? (
          <div className="empty">کوئی نتیجہ نہیں ملا</div>
        ) : (
          <>
            <p className="muted">{data.total} نتائج</p>
            <div className="grid">
              {data.items.map((p) => (
                <PropertyCard
                  key={p.id}
                  property={p}
                  wished={wishIds.includes(p.id)}
                  onToggleWish={toggleWish}
                />
              ))}
            </div>
            {data.pages > 1 && (
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem', justifyContent: 'center' }}>
                {Array.from({ length: data.pages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`btn ${String(n) === filters.page ? '' : 'btn-ghost'}`}
                    onClick={() => update('page', String(n))}
                  >
                    {n}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
