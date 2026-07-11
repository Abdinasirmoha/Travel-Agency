import mongoose from 'mongoose';

const visaTypeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  country: { type: String, required: true },
  durationDays: { type: Number, required: true },
  basePrice: { type: Number, required: true },
  description: { type: String }
}, {
  timestamps: true
});

export default mongoose.model('VisaType', visaTypeSchema);
