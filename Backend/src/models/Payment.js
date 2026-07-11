import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  receiptNumber:      { type: String, required: true, unique: true },
  invoice:            { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
  customer:           { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  amountPaid:         { type: Number, required: true },
  paymentDate:        { type: Date, required: true, default: Date.now },
  paymentMethod:      { type: String, enum: ['Cash', 'Bank Transfer', 'Credit Card', 'Mobile Money', 'Online'], required: true },
  payerAccountNo:     { type: String },                          // Mobile wallet phone number
  reference:          { type: String },
  currency:           { type: String, default: 'USD' },
  status:             { type: String, enum: ['Pending', 'Completed', 'Failed'], default: 'Completed' },
  waafiTransactionId: { type: String },                          // WaafiPay transaction ID (from API response)
}, {
  timestamps: true
});

export default mongoose.model('Payment', paymentSchema);
