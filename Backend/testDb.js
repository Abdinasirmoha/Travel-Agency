import mongoose from 'mongoose';
import Payment from './src/models/Payment.js';
import Invoice from './src/models/Invoice.js';
import Ticket from './src/models/Ticket.js';

mongoose.connect('mongodb://localhost:27017/travelagency').then(async () => {
  const payments = await Payment.find();
  console.log('Payments:', payments);
  const invoices = await Invoice.find();
  console.log('Invoices:', invoices);
  const tickets = await Ticket.find();
  console.log('Tickets:', tickets);
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
