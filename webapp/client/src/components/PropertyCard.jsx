import { Link } from 'react-router-dom';
import { PURPOSE_LABELS, TYPE_LABELS, PLACEHOLDER_IMG, formatPrice } from '../constants';

export default function PropertyCard({ property, onToggleWish, wished }) {
  const img = property.images?.[0] || PLACEHOLDER_IMG;
  const purposeClass = property.purpose === 'rent' ? 'tag-rent' : 'tag-sale';

  return (
    <article className="card">
      <div className="card-media-wrap">
        <Link to={`/property/${property.id}`}>
          <img className="card-img" src={img} alt={property.title} loading="lazy" />
        </Link>
        {onToggleWish && (
          <button
            type="button"
            className="heart"
            title="پسندیدہ"
            onClick={() => onToggleWish(property.id)}
          >
            {wished ? '♥' : '♡'}
          </button>
        )}
      </div>
      <div className="card-body">
        <span className={`tag ${purposeClass}`}>
          {PURPOSE_LABELS[property.purpose] || property.purposeLabel}
        </span>
        <h3 className="card-title">
          <Link to={`/property/${property.id}`}>{property.title}</Link>
        </h3>
        <p className="card-meta">
          {TYPE_LABELS[property.type] || property.typeLabel} · {property.area || property.city}
          {property.size ? ` · ${property.size}` : ''}
        </p>
        <p className="card-price">
          {property.priceLabel || formatPrice(property.price)}
          {property.purpose === 'rent' ? ' / ماہ' : ''}
        </p>
      </div>
    </article>
  );
}
