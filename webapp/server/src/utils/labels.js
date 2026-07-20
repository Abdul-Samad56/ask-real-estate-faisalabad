/** Map Urdu CSV labels ↔ English enum keys used in the API */

export const PURPOSE_URDU_TO_EN = { فروخت: 'sale', کرایہ: 'rent' };
export const PURPOSE_EN_TO_URDU = { sale: 'فروخت', rent: 'کرایہ' };

export const TYPE_URDU_TO_EN = {
  مکان: 'house',
  کمرہ: 'room',
  فلیٹ: 'flat',
  'فارم ہاؤس': 'farmhouse',
  دکان: 'shop',
  آفس: 'office',
  ہال: 'hall',
  عمارت: 'building',
  فیکٹری: 'factory',
  گودام: 'warehouse',
  پلاٹ: 'plot',
  'رہائشی پلاٹ': 'residential_plot',
  'کمرشل پلاٹ': 'commercial_plot',
  'زرعی زمین': 'agricultural',
  'صنعتی زمین': 'industrial',
  'لوئر پورشن': 'lower_portion',
  دیگر: 'other',
};

export const TYPE_EN_TO_URDU = Object.fromEntries(
  Object.entries(TYPE_URDU_TO_EN).map(([ur, en]) => [en, ur])
);

export const FAISALABAD_AREAS = [
  'Millat Town',
  'Eden Garden',
  'Madina Town',
  'Peoples Colony',
  'Susan Road',
  'Kohinoor City',
  'Civil Lines',
  'Wapda City',
  'Canal Road',
  'D Ground',
  'Satiana Road',
  'Jaranwala Road',
  'Sargodha Road',
  'Gulberg',
  'Muslim Town',
  'Ghulam Muhammad Abad',
  'Jinnah Colony',
  'Clock Tower',
  'Other',
];

export function formatPriceZameen(n) {
  if (n == null || n === '') return '—';
  const num = Number(n);
  const fmt = (v) => (v % 1 === 0 ? v.toFixed(0) : v.toFixed(2).replace(/\.?0+$/, ''));
  if (num >= 10000000) return 'PKR ' + fmt(num / 10000000) + ' کروڑ';
  if (num >= 100000) return 'PKR ' + fmt(num / 100000) + ' لاکھ';
  return 'PKR ' + num.toLocaleString('en-PK');
}

export function serializeProperty(doc) {
  const p = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  return {
    id: p._id?.toString?.() || p.id,
    legacyId: p.legacyId || null,
    title: p.title,
    purpose: p.purpose,
    purposeLabel: PURPOSE_EN_TO_URDU[p.purpose] || p.purpose,
    type: p.type,
    typeLabel: TYPE_EN_TO_URDU[p.type] || p.type,
    price: p.price,
    priceLabel: formatPriceZameen(p.price),
    city: p.city,
    area: p.area,
    size: p.size,
    beds: p.beds,
    baths: p.baths,
    floors: p.floors || 0,
    address: p.address || '',
    owner: p.owner,
    phone: p.phone,
    description: p.description,
    images: p.images || [],
    published: p.published,
    featured: p.featured,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}
