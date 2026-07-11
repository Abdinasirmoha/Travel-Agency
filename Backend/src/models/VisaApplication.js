import mongoose from 'mongoose';

const visaApplicationSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  visaType: { type: mongoose.Schema.Types.ObjectId, ref: 'VisaType', required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  totalAmount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  paymentStatus: { type: String, enum: ['Paid', 'Partially Paid', 'Unpaid'], default: 'Unpaid' }
}, {
  timestamps: true
});

export default mongoose.model('VisaApplication', visaApplicationSchema);
