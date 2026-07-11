import mongoose from 'mongoose';

const cargoSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  receiverName: { type: String, required: true },
  receiverPhone: { type: String, required: true },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  weightKg: { type: Number, required: true },
  contentDescription: { type: String },
  shippingDate: { type: Date, required: true },
  status: { type: String, enum: ['Pending', 'In Transit', 'Arrived', 'Delivered', 'Cancelled'], default: 'Pending' },
  totalAmount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  paymentStatus: { type: String, enum: ['Paid', 'Partially Paid', 'Unpaid'], default: 'Unpaid' }
}, {
  timestamps: true
});

export default mongoose.model('Cargo', cargoSchema);
