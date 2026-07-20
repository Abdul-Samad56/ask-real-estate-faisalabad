import mongoose from 'mongoose';

const inquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    inquiryType: { type: String, default: 'contact' },
    role: { type: String, default: '' },
    propertyType: { type: String, default: '' },
    message: { type: String, default: '' },
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', default: null },
  },
  { timestamps: true }
);

export const Inquiry = mongoose.model('Inquiry', inquirySchema);
