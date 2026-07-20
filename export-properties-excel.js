#!/usr/bin/env node
/**
 * demo-listings.js کی 100 پراپرٹیز data/Properties.csv (Excel) میں لکھتا ہے
 */
const fs = require('node:fs');
const path = require('node:path');

const DATA_DIR = path.join(__dirname, 'data');
const OUT = path.join(DATA_DIR, 'Properties.csv');

const LABELS = {
  purpose: { sale: 'فروخت', rent: 'کرایہ' },
  type: {
    house: 'مکان',
    room: 'کمرہ',
    flat: 'فلیٹ',
    shop: 'دکان',
    office: 'آفس',
    warehouse: 'گودام',
    residential_plot: 'رہائشی پلاٹ',
    commercial_plot: 'کمرشل پلاٹ',
    industrial: 'صنعتی زمین',
  },
};

const AREAS = [
  'Wapda City',
  'Canal Road',
  'D Ground',
  'Millat Town',
  'Eden Garden',
  'Madina Town',
  'Peoples Colony',
  'Susan Road',
  'Kohinoor City',
  'Civil Lines',
];

const SALE_TYPES = [
  { type: 'house', label: 'مکان', sizes: ['5 مرلہ', '7 مرلہ', '10 مرلہ', '1 کنال'], beds: [3, 4, 5, 6], price: [8500000, 45000000] },
  { type: 'flat', label: 'فلیٹ', sizes: ['2 مرلہ', '3 مرلہ', '5 مرلہ'], beds: [1, 2, 3], price: [4500000, 12000000] },
  { type: 'shop', label: 'دکان', sizes: ['200 sq ft', '350 sq ft', '500 sq ft'], beds: [0, 0, 0], price: [8000000, 28000000] },
  { type: 'office', label: 'آفس', sizes: ['800 sq ft', '1200 sq ft', '2000 sq ft'], beds: [0, 0, 0], price: [6000000, 22000000] },
  { type: 'residential_plot', label: 'رہائشی پلاٹ', sizes: ['3 مرلہ', '5 مرلہ', '10 مرلہ'], beds: [0, 0, 0], price: [2500000, 15000000] },
  { type: 'commercial_plot', label: 'کمرشل پلاٹ', sizes: ['4 مرلہ', '8 مرلہ', '2 کنال'], beds: [0, 0, 0], price: [5000000, 35000000] },
  { type: 'house', label: 'مکان', sizes: ['5 مرلہ', '10 مرلہ'], beds: [4, 5], price: [12000000, 38000000] },
  { type: 'industrial', label: 'صنعتی زمین', sizes: ['1 کنال', '2 کنال'], beds: [0, 0], price: [25000000, 65000000] },
];

const RENT_TYPES = [
  { type: 'house', label: 'مکان', sizes: ['5 مرلہ', '7 مرلہ', '10 مرلہ'], beds: [3, 4, 5], price: [35000, 95000] },
  { type: 'flat', label: 'فلیٹ', sizes: ['2 مرلہ', '3 مرلہ'], beds: [1, 2], price: [18000, 45000] },
  { type: 'shop', label: 'دکان', sizes: ['150 sq ft', '300 sq ft'], beds: [0, 0], price: [40000, 120000] },
  { type: 'office', label: 'آفس', sizes: ['600 sq ft', '1000 sq ft'], beds: [0, 0], price: [25000, 75000] },
  { type: 'room', label: 'کمرہ', sizes: ['1 کمرہ'], beds: [1, 1], price: [12000, 22000] },
  { type: 'warehouse', label: 'گودام', sizes: ['3000 sq ft', '6000 sq ft'], beds: [0, 0], price: [80000, 200000] },
  { type: 'house', label: 'مکان', sizes: ['5 مرلہ', '8 مرلہ'], beds: [4, 5], price: [45000, 85000] },
  { type: 'flat', label: 'فلیٹ', sizes: ['3 مرلہ', '4 مرلہ'], beds: [2, 3], price: [28000, 55000] },
];

const DESCRIPTIONS = {
  sale: [
    'بہترین لوکیشن، فوری قبضہ، تمام سہولیات موجود',
    'کورنر پراپرٹی، پارک فیسنگ، سیکیورٹی گیٹ',
    'نیا تعمیر، ماڈرن ڈیزائن، ویل مینٹینڈ',
    'سرمایہ کاری کے لیے بہترین موقع',
    'قریب مسجد، اسکول اور مارکیٹ',
    'ڈبل روڈ، وسیع پارکنگ، بجلی گیس دستیاب',
  ],
  rent: [
    'خاندانی ماحول، پانی بجلی گیس دستیاب',
    'فرنشڈ / سیمی فرنشڈ، فوری کرایہ',
    'سیکیورٹی والی سوسائٹی، بچوں کے لیے محفوظ',
    'مرکزی لوکیشن، ٹرانسپورٹ قریب',
    'AC، WiFi، پارکنگ شامل',
    'Bachelors / فیملی دونوں کے لیے موزوں',
  ],
};

const HEADERS = [
  'Timestamp', 'ID', 'Title', 'Purpose', 'Type', 'Price (PKR)', 'City', 'Area', 'Size',
  'Beds', 'Baths', 'Owner', 'Phone', 'Published', 'Featured', 'Description', 'Photo Count',
];

function pick(arr, i) {
  return arr[i % arr.length];
}

function randBetween(min, max, seed) {
  const x = Math.sin(seed * 9999) * 10000;
  const r = x - Math.floor(x);
  return Math.floor(min + r * (max - min + 1));
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(randBetween(1, 20, n), randBetween(0, 59, n + 7), 0, 0);
  return d.toISOString();
}

function buildProperty(purpose, index, typeDef) {
  const area = pick(AREAS, index + (purpose === 'rent' ? 17 : 3));
  const size = pick(typeDef.sizes, index);
  const beds = typeDef.beds[index % typeDef.beds.length] ?? 0;
  const baths = beds > 0 ? Math.max(1, beds - 1) : typeDef.type === 'shop' ? 1 : 0;
  const price = randBetween(typeDef.price[0], typeDef.price[1], index + (purpose === 'sale' ? 1 : 2));
  const purposeUr = purpose === 'sale' ? 'فروخت' : 'کرایہ';
  const title = `${size} ${typeDef.label} — ${area} (${purposeUr})`;
  const desc = pick(DESCRIPTIONS[purpose], index);
  const imageCount = 1 + (index % 3);
  const id = `ask-${purpose}-${String(index + 1).padStart(3, '0')}`;

  return {
    id,
    title,
    purpose,
    type: typeDef.type,
    price,
    city: 'فیصل آباد',
    area,
    size,
    beds,
    baths,
    owner: 'حافظ عبدالصمد خٹک',
    phone: '0321-5315603',
    description: `${desc} — ${area}، فیصل آباد۔ ASK REAL ESTATE کے ذریعے رابطہ کریں۔`,
    featured: index % 7 === 0,
    published: true,
    imageCount,
    createdAt: daysAgo(randBetween(1, 45, index)),
  };
}

function propertySheetRow(p) {
  return [
    p.createdAt,
    p.id,
    p.title,
    LABELS.purpose[p.purpose] || p.purpose,
    LABELS.type[p.type] || p.type,
    p.price,
    p.city,
    p.area,
    p.size,
    p.beds,
    p.baths,
    p.owner,
    p.phone,
    p.published ? 'Yes' : 'No',
    p.featured ? 'Yes' : 'No',
    (p.description || '').slice(0, 5000),
    p.imageCount,
  ];
}

function csvCell(value) {
  const s = String(value ?? '');
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function csvLine(row) {
  return row.map(csvCell).join(',');
}

const props = [];
for (let i = 0; i < 50; i++) props.push(buildProperty('sale', i, pick(SALE_TYPES, i)));
for (let i = 0; i < 50; i++) props.push(buildProperty('rent', i, pick(RENT_TYPES, i)));

fs.mkdirSync(DATA_DIR, { recursive: true });
const rows = props.map(propertySheetRow);
const content = '\uFEFF' + [csvLine(HEADERS), ...rows.map(csvLine)].join('\r\n');
fs.writeFileSync(OUT, content, 'utf8');

console.log(`Properties.csv تیار: ${rows.length} پراپرٹیز`);
console.log(OUT);
