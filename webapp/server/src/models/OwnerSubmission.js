import mongoose from 'mongoose';
import { PROPERTY_TYPES } from './Property.js';

const ownerSubmissionSchema = new mongoose.Schema(
  {
    purpose: { type: String, enum: ['sale', 'rent'], required: true },
    type: { type: String, enum: PROPERTY_TYPES, default: 'house' },
    title: { type: String, required: true, trim: true },
    price: { type: Number, default: 0 },
    city: { type: String, default: 'فیصل آباد' },
    area: { type: String, default: '' },
    size: { type: String, default: '' },
    beds: { type: Number, default: 0 },
    baths: { type: Number, default: 0 },
    floors: { type: Number, default: 0 },
    address: { type: String, default: '' },
    description: { type: String, default: '' },
    ownerName: { type: String, default: '' },
    ownerPhone: { type: String, default: '' },
    ownerEmail: { type: String, default: '' },
    images: [{ type: String }],
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'converted', 'rejected'],
      default: 'pending',
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    convertedPropertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', default: null },
  },
  { timestamps: true }
);

export const OwnerSubmission = mongoose.model('OwnerSubmission', ownerSubmissionSchema);
