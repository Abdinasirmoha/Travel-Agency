import mongoose from 'mongoose';

const tourBookingSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  package: { type: mongoose.Schema.Types.ObjectId, ref: 'TouristPackage', required: true },
  travelDate: { type: Date, required: true },
  status: { type: String, enum: ['Pending', 'Confirmed', 'Cancelled'], default: 'Pending' },
  totalAmount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  paymentStatus: { type: String, enum: ['Paid', 'Partially Paid', 'Unpaid'], default: 'Unpaid' }
}, {
  timestamps: true
});

export default mongoose.model('TourBooking', tourBookingSchema);
