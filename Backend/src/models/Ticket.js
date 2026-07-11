import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  flightDetails: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight', required: true },
  price: { type: Number, required: true, default: 0 },
  totalAmount: { type: Number, required: true },
  profit: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  currency: { type: String, default: 'USD' },
  paymentStatus: { type: String, enum: ['Paid', 'Partially Paid', 'Unpaid'], default: 'Unpaid' }
}, {
  timestamps: true
});

export default mongoose.model('Ticket', ticketSchema);
