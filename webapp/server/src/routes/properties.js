import { Router } from 'express';
import { Property } from '../models/Property.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { serializeProperty } from '../utils/labels.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const {
      purpose,
      type,
      city,
      area,
      q,
      minPrice,
      maxPrice,
      beds,
      featured,
      page = '1',
      limit = '24',
      sort = 'newest',
    } = req.query;

    const filter = { published: true };
    if (purpose === 'sale' || purpose === 'rent') filter.purpose = purpose;
    if (type) filter.type = type;
    if (city) filter.city = new RegExp(String(city), 'i');
    if (area) filter.area = new RegExp(String(area), 'i');
    if (featured === '1' || featured === 'true') filter.featured = true;
    if (beds) filter.beds = { $gte: Number(beds) || 0 };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice) || 0;
      if (maxPrice) filter.price.$lte = Number(maxPrice) || Number.MAX_SAFE_INTEGER;
    }
    if (q) {
      const rx = new RegExp(String(q).trim(), 'i');
      filter.$or = [{ title: rx }, { area: rx }, { description: rx }, { city: rx }];
    }

    let sortSpec = { featured: -1, createdAt: -1 };
    if (sort === 'price_asc') sortSpec = { price: 1 };
    if (sort === 'price_desc') sortSpec = { price: -1 };
    if (sort === 'oldest') sortSpec = { createdAt: 1 };

    const pageNum = Math.max(1, Number(page) || 1);
    const lim = Math.min(100, Math.max(1, Number(limit) || 24));
    const skip = (pageNum - 1) * lim;

    const [items, total] = await Promise.all([
      Property.find(filter).sort(sortSpec).skip(skip).limit(lim),
      Property.countDocuments(filter),
    ]);

    res.json({
      items: items.map(serializeProperty),
      total,
      page: pageNum,
      pages: Math.ceil(total / lim) || 1,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'پراپرٹیز لوڈ نہیں ہوئیں' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let doc = null;
    if (/^[a-f\d]{24}$/i.test(id)) {
      doc = await Property.findById(id);
    }
    if (!doc) {
      doc = await Property.findOne({ legacyId: id });
    }
    if (!doc || !doc.published) {
      return res.status(404).json({ error: 'پراپرٹی نہیں ملی' });
    }
    const similar = await Property.find({
      _id: { $ne: doc._id },
      published: true,
      purpose: doc.purpose,
      $or: [{ type: doc.type }, { area: doc.area }],
    })
      .sort({ featured: -1, createdAt: -1 })
      .limit(6);

    res.json({
      property: serializeProperty(doc),
      similar: similar.map(serializeProperty),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'پراپرٹی لوڈ نہیں ہوئی' });
  }
});

router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const body = req.body || {};
    const doc = await Property.create({
      title: body.title,
      purpose: body.purpose,
      type: body.type || 'house',
      price: Number(body.price) || 0,
      city: body.city || 'فیصل آباد',
      area: body.area || '',
      size: body.size || '',
      beds: Number(body.beds) || 0,
      baths: Number(body.baths) || 0,
      floors: Number(body.floors) || 0,
      address: body.address || '',
      owner: body.owner || '',
      phone: body.phone || '',
      description: body.description || '',
      images: Array.isArray(body.images) ? body.images : [],
      published: body.published !== false,
      featured: Boolean(body.featured),
      createdBy: req.user._id,
    });
    res.status(201).json({ property: serializeProperty(doc) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'پراپرٹی محفوظ نہیں ہوئی' });
  }
});

export default router;
