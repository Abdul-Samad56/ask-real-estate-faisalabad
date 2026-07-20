/**
 * Seed MongoDB Atlas from data/Properties.csv
 */
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || '';
const CSV_PATH = path.join(__dirname, '..', 'data', 'Properties.csv');

const PURPOSE_MAP = { فروخت: 'sale', کرایہ: 'rent', sale: 'sale', rent: 'rent' };
const TYPE_MAP = {
  مکان: 'house',
  کمرہ: 'room',
  فلیٹ: 'flat',
  دکان: 'shop',
  آفس: 'office',
  'رہائشی پلاٹ': 'residential_plot',
  'کمرشل پلاٹ': 'commercial_plot',
  'صنعتی زمین': 'industrial',
  'زرعی زمین': 'agricultural',
  پلاٹ: 'plot',
  عمارت: 'building',
  فیکٹری: 'factory',
  گودام: 'warehouse',
  'فارم ہاؤس': 'farmhouse',
  'لوئر پورشن': 'lower_portion',
  دیگر: 'other',
};

const propertySchema = new mongoose.Schema(
  {
    legacy_id: String,
    title: String,
    purpose: String,
    type: String,
    price: Number,
    city: String,
    area: String,
    size: String,
    beds: Number,
    baths: Number,
    floors: Number,
    description: String,
    owner: String,
    phone: String,
    images: [String],
    published: Boolean,
    featured: Boolean,
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

const Property = mongoose.models.Property || mongoose.model('Property', propertySchema);

function yes(v) {
  return String(v || '').trim().toLowerCase() === 'yes';
}

async function seed() {
  if (!MONGODB_URI) {
    console.error('Set MONGODB_URI in .env');
    process.exit(1);
  }
  if (!fs.existsSync(CSV_PATH)) {
    console.error('CSV missing:', CSV_PATH);
    process.exit(1);
  }

  const rows = parse(fs.readFileSync(CSV_PATH, 'utf8'), {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  await mongoose.connect(MONGODB_URI);
  console.log('Connected. CSV rows:', rows.length);

  let n = 0;
  for (const row of rows) {
    const legacy_id = row.ID || row.Id || row.id;
    if (!legacy_id) continue;
    const purposeRaw = row.Purpose || 'فروخت';
    const purpose = PURPOSE_MAP[purposeRaw] || PURPOSE_MAP[purposeRaw.toLowerCase()] || 'sale';
    const typeRaw = row.Type || '';
    const type = TYPE_MAP[typeRaw] || 'other';

    await Property.findOneAndUpdate(
      { legacy_id: String(legacy_id) },
      {
        $set: {
          legacy_id: String(legacy_id),
          title: row.Title || 'پراپرٹی',
          purpose,
          type,
          price: Number(String(row['Price (PKR)'] || '0').replace(/,/g, '')) || 0,
          city: row.City || 'فیصل آباد',
          area: row.Area || '',
          size: row.Size || '',
          beds: Number(row.Beds) || 0,
          baths: Number(row.Baths) || 0,
          owner: row.Owner || '',
          phone: row.Phone || '',
          description: row.Description || '',
          published: yes(row.Published) || String(row.Published) === 'Yes',
          featured: yes(row.Featured),
          images: [],
          created_at: row.Timestamp ? new Date(row.Timestamp) : new Date(),
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    n += 1;
  }

  console.log(`Seeded ${n} properties into MongoDB Atlas`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
