import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import PropertyCard from '../components/PropertyCard';
import { AREAS, TYPE_LABELS } from '../constants';

export default function HomePage() {
  const navigate = useNavigate();
  const [featuredSale, setFeaturedSale] = useState([]);
  const [featuredRent, setFeaturedRent] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ purpose: 'sale', type: '', area: '', q: '' });

  useEffect(() => {
    Promise.all([
      api.properties({ purpose: 'sale', featured: '1', limit: 6 }),
      api.properties({ purpose: 'rent', featured: '1', limit: 6 }),
    ])
      .then(([sale, rent]) => {
        setFeaturedSale(sale.items?.length ? sale.items : []);
        setFeaturedRent(rent.items?.length ? rent.items : []);
        if (!sale.items?.length) {
          return api.properties({ purpose: 'sale', limit: 6 }).then((d) => setFeaturedSale(d.items || []));
        }
        if (!rent.items?.length) {
          return api.properties({ purpose: 'rent', limit: 6 }).then((d) => setFeaturedRent(d.items || []));
        }
      })
      .catch((err) => setError(err.message || 'ڈیٹا لوڈ نہیں ہوا — API چیک کریں'));
  }, []);

  function onSearch(e) {
    e.preventDefault();
    const q = new URLSearchParams();
    Object.entries(form).forEach(([k, v]) => v && q.set(k, v));
    navigate(`/search?${q}`);
  }

  return (
    <>
      <section className="hero">
        <div className="container hero-content">
          <h1>ASK REAL ESTATE FAISALABAD</h1>
          <p>فیصل آباد میں خرید، فروخت اور کرایہ — ایک جگہ پر معتبر لسٹنگز۔</p>
          <form className="search-panel" onSubmit={onSearch}>
            <div className="field">
              <label>مقصد</label>
              <select
                value={form.purpose}
                onChange={(e) => setForm({ ...form, purpose: e.target.value })}
              >
                <option value="sale">فروخت</option>
                <option value="rent">کرایہ</option>
              </select>
            </div>
            <div className="field">
              <label>قسم</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
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
              <select value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })}>
                <option value="">سب علاقے</option>
                {AREAS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>تلاش</label>
              <input
                placeholder="عنوان یا الفاظ…"
                value={form.q}
                onChange={(e) => setForm({ ...form, q: e.target.value })}
              />
            </div>
            <button className="btn" type="submit">
              تلاش
            </button>
          </form>
        </div>
      </section>

      {error && (
        <div className="container" style={{ marginTop: '1rem' }}>
          <div className="alert alert-error">{error}</div>
        </div>
      )}

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <h2>نمایاں فروخت</h2>
              <p>فیچرڈ پراپرٹیز برائے خریداری</p>
            </div>
            <Link to="/search?purpose=sale" className="btn btn-outline">
              مزید دیکھیں
            </Link>
          </div>
          {featuredSale.length ? (
            <div className="grid">
              {featuredSale.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          ) : (
            <div className="empty">ابھی کوئی فروخت لسٹنگ نہیں — CSV seed چلائیں</div>
          )}
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <div>
              <h2>نمایاں کرایہ</h2>
              <p>کرایہ پر دستیاب پراپرٹیز</p>
            </div>
            <Link to="/search?purpose=rent" className="btn btn-outline">
              مزید دیکھیں
            </Link>
          </div>
          {featuredRent.length ? (
            <div className="grid">
              {featuredRent.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          ) : (
            <div className="empty">ابھی کوئی کرایہ لسٹنگ نہیں</div>
          )}
        </div>
      </section>
    </>
  );
}
