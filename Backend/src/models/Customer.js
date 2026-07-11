import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  passportNo: { type: String, required: true },
  nationality: { type: String, required: true },
  contact: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Male' },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  photo: { type: String },
  lastBooking: { type: Date }
}, {
  timestamps: true
});

export default mongoose.model('Customer', customerSchema);
