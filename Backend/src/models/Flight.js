import mongoose from 'mongoose';

const flightSchema = new mongoose.Schema({
  flightNumber: { type: String, required: true, unique: true },
  airline: { type: String, required: true },
  airlineLogo: { type: String },
  route: { type: String },
  departureTime: { type: Date, required: true },
  arrivalTime: { type: Date, required: true },
  status: { type: String, enum: ['ON TIME', 'DELAYED', 'SCHEDULED', 'CANCELLED'], default: 'SCHEDULED' },
  seatsAvailable: { type: Number, required: true },
  totalSeats: { type: Number, required: true },
  price: { type: Number, required: true, default: 0 },
  type: { type: String, enum: ['International', 'Domestic'], required: true }
}, {
  timestamps: true
});

export default mongoose.model('Flight', flightSchema);
