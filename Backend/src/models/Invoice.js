import mongoose from 'mongoose';

const invoiceItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  linkedItemId: { type: mongoose.Schema.Types.ObjectId },
  linkedItemType: { type: String, enum: ['Ticket', 'Visa', 'Tour', 'Cargo'] }
});

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  date: { type: Date, required: true, default: Date.now },
  dueDate: { type: Date, required: true },
  items: [invoiceItemSchema],
  totalAmount: { type: Number, required: true },
  amountPaid: { type: Number, default: 0 },
  status: { type: String, enum: ['Draft', 'Unpaid', 'Partially Paid', 'Paid'], default: 'Unpaid' },
  currency: { type: String, default: 'USD' }
}, {
  timestamps: true
});

export default mongoose.model('Invoice', invoiceSchema);
