import mongoose from 'mongoose';

const touristPackageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  destination: { type: String, required: true },
  category: { type: String, enum: ['Religious', 'Adventure', 'Leisure', 'Cultural', 'Other'], default: 'Leisure' },
  durationDays: { type: Number, required: true },
  basePrice: { type: Number, required: true },
  includesFlight: { type: Boolean, default: false },
  includesHotel: { type: Boolean, default: false },
  description: { type: String }
}, {
  timestamps: true
});

export default mongoose.model('TouristPackage', touristPackageSchema);
