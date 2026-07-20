export const SITE = {
  name: 'ASK REAL ESTATE FAISALABAD',
  shortName: 'ASK Estate',
  phone: '03215315603',
  phoneDisplay: '0321-5315603',
  contactName: 'حافظ عبدالصمد خٹک',
  email: 'abdulsamadkhattak5@gmail.com',
  city: 'فیصل آباد',
};

export const PURPOSE_LABELS = { sale: 'فروخت', rent: 'کرایہ' };

export const TYPE_LABELS = {
  house: 'مکان',
  room: 'کمرہ',
  flat: 'فلیٹ',
  penthouse: 'Penthouse',
  farmhouse: 'فارم ہاؤس',
  shop: 'دکان',
  office: 'آفس',
  hall: 'ہال',
  building: 'عمارت',
  factory: 'فیکٹری',
  warehouse: 'گودام',
  plot: 'پلاٹ',
  residential_plot: 'رہائشی پلاٹ',
  commercial_plot: 'کمرشل پلاٹ',
  agricultural: 'زرعی زمین',
  industrial: 'صنعتی زمین',
  lower_portion: 'لوئر پورشن',
  other: 'دیگر',
};

export const AREAS = [
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

export function formatPrice(n) {
  if (n == null || n === '') return '—';
  const num = Number(n);
  const fmt = (v) => (v % 1 === 0 ? v.toFixed(0) : v.toFixed(2).replace(/\.?0+$/, ''));
  if (num >= 10000000) return 'PKR ' + fmt(num / 10000000) + ' کروڑ';
  if (num >= 100000) return 'PKR ' + fmt(num / 100000) + ' لاکھ';
  return 'PKR ' + num.toLocaleString('en-PK');
}

export function whatsappLink(phone, text = '') {
  const digits = String(phone || SITE.phone).replace(/\D/g, '');
  const wa = digits.startsWith('92') ? digits : digits.replace(/^0/, '92');
  return `https://wa.me/${wa}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}

export const PLACEHOLDER_IMG =
  'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop&q=80';
