import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  category: { type: String, enum: ['Office', 'Marketing', 'Salary', 'Utilities', 'Other'], default: 'Office' },
  status: { type: String, enum: ['Paid', 'Pending'], default: 'Paid' },
  notes: { type: String }
}, {
  timestamps: true
});

export default mongoose.model('Expense', expenseSchema);
