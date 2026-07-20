import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Property } from '../src/models/Property.js';
import { PURPOSE_URDU_TO_EN, TYPE_URDU_TO_EN } from '../src/utils/labels.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const CSV_PATH = path.resolve(
  __dirname,
  '..',
  '..',
  '..',
  'data',
  'Properties.csv'
);

function yes(v) {
  return String(v || '').trim().toLowerCase() === 'yes';
}

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Set MONGODB_URI in server/.env');
    process.exit(1);
  }
  if (!fs.existsSync(CSV_PATH)) {
    console.error('CSV not found:', CSV_PATH);
    process.exit(1);
  }

  const raw = fs.readFileSync(CSV_PATH, 'utf8');
  const rows = parse(raw, { columns: true, skip_empty_lines: true, trim: true });

  await mongoose.connect(uri);
  console.log('Connected. Rows in CSV:', rows.length);

  let upserted = 0;
  for (const row of rows) {
    const legacyId = row.ID || row.Id || row.id;
    if (!legacyId) continue;

    const purposeRaw = row.Purpose || '';
    const purpose =
      PURPOSE_URDU_TO_EN[purposeRaw] ||
      (purposeRaw.toLowerCase() === 'sale' || purposeRaw.toLowerCase() === 'rent'
        ? purposeRaw.toLowerCase()
        : 'sale');

    const typeRaw = row.Type || '';
    const type = TYPE_URDU_TO_EN[typeRaw] || 'other';

    const doc = {
      legacyId: String(legacyId),
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
      published: yes(row.Published) || row.Published === 'Yes',
      featured: yes(row.Featured),
      images: [],
      createdAt: row.Timestamp ? new Date(row.Timestamp) : new Date(),
    };

    await Property.findOneAndUpdate(
      { legacyId: doc.legacyId },
      { $set: doc },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    upserted += 1;
  }

  console.log(`Seed complete: ${upserted} properties upserted`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
