import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['Visa', 'Ticket', 'Tour', 'Cargo', 'System'],
    default: 'System'
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'type'
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema);
