import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api';
import PropertyCard from '../components/PropertyCard';
import { PURPOSE_LABELS, TYPE_LABELS, PLACEHOLDER_IMG, formatPrice, whatsappLink, SITE } from '../constants';

export default function PropertyPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setData(null);
    api
      .property(id)
      .then(setData)
      .catch((err) => setError(err.message));
  }, [id]);

  if (error) {
    return (
      <section className="section container">
        <div className="alert alert-error">{error}</div>
        <Link to="/search">واپس تلاش</Link>
      </section>
    );
  }

  if (!data) {
    return <div className="empty">لوڈ ہو رہا ہے…</div>;
  }

  const p = data.property;
  const img = p.images?.[0] || PLACEHOLDER_IMG;
  const msg = `السلام علیکم، مجھے اس پراپرٹی میں دلچسپی ہے: ${p.title} (${SITE.name})`;

  return (
    <section className="section">
      <div className="container detail">
        <div className="detail-media">
          <img src={img} alt={p.title} />
        </div>
        <div className="panel">
          <span className={`tag ${p.purpose === 'rent' ? 'tag-rent' : 'tag-sale'}`}>
            {PURPOSE_LABELS[p.purpose]}
          </span>
          <h1 className="page-title" style={{ marginTop: '0.75rem' }}>
            {p.title}
          </h1>
          <p className="card-price" style={{ fontSize: '1.35rem' }}>
            {p.priceLabel || formatPrice(p.price)}
            {p.purpose === 'rent' ? ' / ماہ' : ''}
          </p>
          <p className="muted">
            {TYPE_LABELS[p.type]} · {p.area} · {p.city}
            {p.size ? ` · ${p.size}` : ''}
          </p>
          {(p.beds > 0 || p.baths > 0) && (
            <p>
              {p.beds > 0 && `${p.beds} بیڈز · `}
              {p.baths > 0 && `${p.baths} باتھ`}
            </p>
          )}
          <p style={{ whiteSpace: 'pre-wrap' }}>{p.description}</p>
          <p>
            <strong>مالک / ایجنٹ:</strong> {p.owner || SITE.contactName}
            <br />
            <strong>فون:</strong> {p.phone || SITE.phoneDisplay}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginTop: '1rem' }}>
            <a
              className="btn btn-wa"
              href={whatsappLink(p.phone || SITE.phone, msg)}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp
            </a>
            <a className="btn btn-outline" href={`tel:${p.phone || SITE.phone}`}>
              کال کریں
            </a>
          </div>
        </div>
      </div>

      {data.similar?.length > 0 && (
        <div className="container" style={{ marginTop: '2rem' }}>
          <h2>ملتی جلتی پراپرٹیز</h2>
          <div className="grid">
            {data.similar.map((s) => (
              <PropertyCard key={s.id} property={s} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
