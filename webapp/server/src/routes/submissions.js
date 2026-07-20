import { Router } from 'express';
import { OwnerSubmission } from '../models/OwnerSubmission.js';
import { Property } from '../models/Property.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { serializeProperty } from '../utils/labels.js';

const router = Router();

function serializeSubmission(doc) {
  const s = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  return {
    id: s._id.toString(),
    purpose: s.purpose,
    type: s.type,
    title: s.title,
    price: s.price,
    city: s.city,
    area: s.area,
    size: s.size,
    beds: s.beds,
    baths: s.baths,
    floors: s.floors,
    address: s.address,
    description: s.description,
    ownerName: s.ownerName,
    ownerPhone: s.ownerPhone,
    ownerEmail: s.ownerEmail,
    images: s.images || [],
    status: s.status,
    convertedPropertyId: s.convertedPropertyId?.toString?.() || null,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  };
}

router.post('/', requireAuth, async (req, res) => {
  try {
    const b = req.body || {};
    if (!b.title?.trim() || !b.purpose) {
      return res.status(400).json({ error: 'عنوان اور مقصد درکار ہے' });
    }
    const doc = await OwnerSubmission.create({
      purpose: b.purpose,
      type: b.type || 'house',
      title: b.title.trim(),
      price: Number(b.price) || 0,
      city: b.city || 'فیصل آباد',
      area: b.area || '',
      size: b.size || '',
      beds: Number(b.beds) || 0,
      baths: Number(b.baths) || 0,
      floors: Number(b.floors) || 0,
      address: b.address || '',
      description: b.description || '',
      ownerName: b.ownerName || req.user.name,
      ownerPhone: b.ownerPhone || req.user.phone,
      ownerEmail: b.ownerEmail || req.user.email,
      images: Array.isArray(b.images) ? b.images.slice(0, 12) : [],
      userId: req.user._id,
    });
    res.status(201).json({ submission: serializeSubmission(doc) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'سبمشن محفوظ نہیں ہوئی' });
  }
});

router.get('/mine', requireAuth, async (req, res) => {
  const list = await OwnerSubmission.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json({ items: list.map(serializeSubmission) });
});

router.get('/', requireAuth, requireAdmin, async (req, res) => {
  const status = req.query.status;
  const filter = status ? { status } : {};
  const list = await OwnerSubmission.find(filter).sort({ createdAt: -1 }).limit(200);
  res.json({ items: list.map(serializeSubmission) });
});

router.patch('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const doc = await OwnerSubmission.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'سبمشن نہیں ملی' });

    const { status, convert } = req.body || {};
    if (status && ['pending', 'reviewed', 'converted', 'rejected'].includes(status)) {
      doc.status = status;
    }

    if (convert) {
      const prop = await Property.create({
        title: doc.title,
        purpose: doc.purpose,
        type: doc.type,
        price: doc.price,
        city: doc.city,
        area: doc.area,
        size: doc.size,
        beds: doc.beds,
        baths: doc.baths,
        floors: doc.floors,
        address: doc.address,
        description: doc.description,
        owner: doc.ownerName,
        phone: doc.ownerPhone,
        images: doc.images,
        published: true,
        featured: false,
        createdBy: req.user._id,
      });
      doc.status = 'converted';
      doc.convertedPropertyId = prop._id;
      await doc.save();
      return res.json({
        submission: serializeSubmission(doc),
        property: serializeProperty(prop),
      });
    }

    await doc.save();
    res.json({ submission: serializeSubmission(doc) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'اپڈیٹ ناکام' });
  }
});

export default router;
