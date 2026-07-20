import mongoose from 'mongoose';

export const PROPERTY_TYPES = [
  'house',
  'room',
  'flat',
  'penthouse',
  'farmhouse',
  'shop',
  'office',
  'hall',
  'building',
  'factory',
  'warehouse',
  'plot',
  'residential_plot',
  'commercial_plot',
  'agricultural',
  'industrial',
  'lower_portion',
  'other',
];

const propertySchema = new mongoose.Schema(
  {
    legacyId: { type: String, index: true, sparse: true },
    title: { type: String, required: true, trim: true },
    purpose: { type: String, enum: ['sale', 'rent'], required: true },
    type: { type: String, enum: PROPERTY_TYPES, default: 'house' },
    price: { type: Number, default: 0 },
    city: { type: String, default: 'فیصل آباد' },
    area: { type: String, default: '', trim: true },
    size: { type: String, default: '' },
    beds: { type: Number, default: 0 },
    baths: { type: Number, default: 0 },
    floors: { type: Number, default: 0 },
    address: { type: String, default: '' },
    owner: { type: String, default: '' },
    phone: { type: String, default: '' },
    description: { type: String, default: '' },
    images: [{ type: String }],
    published: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

propertySchema.index({ purpose: 1, published: 1, featured: -1, createdAt: -1 });
propertySchema.index({ city: 1, area: 1, type: 1, price: 1 });

export const Property = mongoose.model('Property', propertySchema);
