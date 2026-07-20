import { Router } from 'express';
import { Inquiry } from '../models/Inquiry.js';
import { Wishlist } from '../models/Wishlist.js';
import { Property } from '../models/Property.js';
import { requireAuth } from '../middleware/auth.js';
import { serializeProperty, FAISALABAD_AREAS, TYPE_EN_TO_URDU, PURPOSE_EN_TO_URDU } from '../utils/labels.js';
import { site } from '../config.js';

const inquiries = Router();
const wishlist = Router();
const meta = Router();

inquiries.post('/', async (req, res) => {
  try {
    const { name, phone, message, inquiryType, role, propertyType, propertyId } = req.body || {};
    if (!name?.trim() || !phone?.trim()) {
      return res.status(400).json({ error: 'نام اور فون درکار ہے' });
    }
    const doc = await Inquiry.create({
      name: name.trim(),
      phone: phone.trim(),
      message: message || '',
      inquiryType: inquiryType || 'contact',
      role: role || '',
      propertyType: propertyType || '',
      propertyId: propertyId || null,
    });
    res.status(201).json({ id: doc._id.toString() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'انکوائری محفوظ نہیں ہوئی' });
  }
});

wishlist.get('/', requireAuth, async (req, res) => {
  let list = await Wishlist.findOne({ userId: req.user._id });
  if (!list) list = await Wishlist.create({ userId: req.user._id, propertyIds: [] });
  const props = await Property.find({ _id: { $in: list.propertyIds }, published: true });
  const order = new Map(list.propertyIds.map((id, i) => [id.toString(), i]));
  props.sort((a, b) => (order.get(a._id.toString()) ?? 0) - (order.get(b._id.toString()) ?? 0));
  res.json({
    ids: list.propertyIds.map((id) => id.toString()),
    items: props.map(serializeProperty),
  });
});

wishlist.post('/:propertyId', requireAuth, async (req, res) => {
  const { propertyId } = req.params;
  const prop = await Property.findById(propertyId);
  if (!prop) return res.status(404).json({ error: 'پراپرٹی نہیں ملی' });
  let list = await Wishlist.findOne({ userId: req.user._id });
  if (!list) list = await Wishlist.create({ userId: req.user._id, propertyIds: [] });
  const exists = list.propertyIds.some((id) => id.toString() === propertyId);
  if (!exists) {
    list.propertyIds.push(prop._id);
    await list.save();
  }
  res.json({ ids: list.propertyIds.map((id) => id.toString()) });
});

wishlist.delete('/:propertyId', requireAuth, async (req, res) => {
  let list = await Wishlist.findOne({ userId: req.user._id });
  if (!list) return res.json({ ids: [] });
  list.propertyIds = list.propertyIds.filter((id) => id.toString() !== req.params.propertyId);
  await list.save();
  res.json({ ids: list.propertyIds.map((id) => id.toString()) });
});

meta.get('/site', (_req, res) => {
  res.json({
    ...site,
    areas: FAISALABAD_AREAS,
    types: TYPE_EN_TO_URDU,
    purposes: PURPOSE_EN_TO_URDU,
  });
});

export { inquiries, wishlist, meta };
