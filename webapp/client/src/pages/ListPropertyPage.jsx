import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../auth';
import { AREAS, TYPE_LABELS } from '../constants';

export default function ListPropertyPage() {
  const { isAuth, user, loading } = useAuth();
  const [form, setForm] = useState({
    purpose: 'sale',
    type: 'house',
    title: '',
    price: '',
    city: 'فیصل آباد',
    area: '',
    size: '',
    beds: '0',
    baths: '0',
    floors: '0',
    address: '',
    description: '',
    ownerName: '',
    ownerPhone: '',
  });
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [busy, setBusy] = useState(false);

  if (loading) return <div className="empty">لوڈ…</div>;
  if (!isAuth) return <Navigate to="/login" replace />;

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setOk('');
    setBusy(true);
    try {
      await api.submitListing({
        ...form,
        price: Number(form.price) || 0,
        beds: Number(form.beds) || 0,
        baths: Number(form.baths) || 0,
        floors: Number(form.floors) || 0,
        ownerName: form.ownerName || user.name,
        ownerPhone: form.ownerPhone || user.phone,
        ownerEmail: user.email,
      });
      setOk('آپ کی پراپرٹی جمع ہو گئی — ایڈمن جائزے کے بعد شائع ہو گی۔');
      setForm((f) => ({ ...f, title: '', price: '', description: '', address: '', size: '' }));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 720 }}>
        <h1 className="page-title">اپنی پراپرٹی لگائیں</h1>
        <p className="muted">تفصیلات بھریں — ASK ٹیم تصدیق کے بعد لسٹنگ شائع کرے گی۔</p>
        {error && <div className="alert alert-error">{error}</div>}
        {ok && <div className="alert alert-ok">{ok}</div>}
        <form className="panel form-grid" onSubmit={onSubmit}>
          <div className="field">
            <label>مقصد</label>
            <select value={form.purpose} onChange={(e) => set('purpose', e.target.value)}>
              <option value="sale">فروخت</option>
              <option value="rent">کرایہ</option>
            </select>
          </div>
          <div className="field">
            <label>قسم</label>
            <select value={form.type} onChange={(e) => set('type', e.target.value)}>
              {Object.entries(TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div className="field full">
            <label>عنوان</label>
            <input required value={form.title} onChange={(e) => set('title', e.target.value)} />
          </div>
          <div className="field">
            <label>قیمت (PKR)</label>
            <input
              type="number"
              required
              value={form.price}
              onChange={(e) => set('price', e.target.value)}
            />
          </div>
          <div className="field">
            <label>سائز</label>
            <input
              placeholder="مثلاً 5 مرلہ"
              value={form.size}
              onChange={(e) => set('size', e.target.value)}
            />
          </div>
          <div className="field">
            <label>علاقہ</label>
            <select value={form.area} onChange={(e) => set('area', e.target.value)}>
              <option value="">منتخب کریں</option>
              {AREAS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>شہر</label>
            <input value={form.city} onChange={(e) => set('city', e.target.value)} />
          </div>
          <div className="field">
            <label>بیڈز</label>
            <input type="number" value={form.beds} onChange={(e) => set('beds', e.target.value)} />
          </div>
          <div className="field">
            <label>باتھ</label>
            <input type="number" value={form.baths} onChange={(e) => set('baths', e.target.value)} />
          </div>
          <div className="field full">
            <label>پتہ</label>
            <input value={form.address} onChange={(e) => set('address', e.target.value)} />
          </div>
          <div className="field full">
            <label>تفصیل</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
            />
          </div>
          <div className="field">
            <label>مالک کا نام</label>
            <input
              placeholder={user?.name}
              value={form.ownerName}
              onChange={(e) => set('ownerName', e.target.value)}
            />
          </div>
          <div className="field">
            <label>فون</label>
            <input
              placeholder={user?.phone || '03xx…'}
              value={form.ownerPhone}
              onChange={(e) => set('ownerPhone', e.target.value)}
            />
          </div>
          <div className="full" style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn" type="submit" disabled={busy}>
              {busy ? 'جمع ہو رہا ہے…' : 'جمع کرائیں'}
            </button>
            <Link className="btn btn-ghost" to="/account">
              میری سبمشنز
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
}
