// Trigger nodemon restart
import express from 'express';
import Stripe from 'stripe';
import Invoice from '../models/Invoice.js';
import Payment from '../models/Payment.js';
import Ticket from '../models/Ticket.js';
import VisaApplication from '../models/VisaApplication.js';
import TourBooking from '../models/TourBooking.js';
import Cargo from '../models/Cargo.js';
import dotenv from 'dotenv';
dotenv.config({ override: true });

const router = express.Router();
console.log("Loaded Stripe Key:", process.env.STRIPE_SECRET_KEY);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// @route   POST /api/stripe/create-payment-intent
// @desc    Create a Stripe PaymentIntent for an invoice
// @access  Public
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { invoiceId, amount, currency } = req.body;

    if (!invoiceId || !amount) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Amount needs to be in the smallest currency unit (e.g., cents for USD)
    const amountInCents = Math.round(Number(amount) * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: (currency || invoice.currency || 'usd').toLowerCase(),
      metadata: {
        invoiceId: invoice._id.toString(),
        customerId: invoice.customer ? invoice.customer.toString() : null
      },
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Stripe Create PaymentIntent Error:', error);
    res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
});

// @route   POST /api/stripe/confirm-payment
// @desc    Confirm a successful Stripe payment on our backend
// @access  Public
router.post('/confirm-payment', async (req, res) => {
  try {
    const { paymentIntentId, invoiceId, amountPaid, currency } = req.body;

    if (!paymentIntentId || !invoiceId || !amountPaid) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Verify the PaymentIntent via Stripe SDK
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: 'Payment has not succeeded in Stripe' });
    }

    // Check if we already recorded this payment to prevent duplicates
    const existingPayment = await Payment.findOne({ reference: paymentIntentId });
    if (existingPayment) {
      return res.status(200).json({ message: 'Payment already processed', payment: existingPayment });
    }

    // Create the Payment Record
    const newPayment = new Payment({
      receiptNumber: `REC-${Math.floor(1000 + Math.random() * 90000)}`,
      invoice: invoice._id,
      customer: invoice.customer,
      amountPaid: Number(amountPaid),
      paymentMethod: 'Credit Card',
      reference: paymentIntentId,
      currency: (currency || invoice.currency || 'USD').toUpperCase(),
      status: 'Completed'
    });
    const savedPayment = await newPayment.save();

    // Update the Invoice
    const allPayments = await Payment.find({ invoice: invoice._id, status: 'Completed' });
    const totalPaid = allPayments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
    invoice.amountPaid = totalPaid;

    if (totalPaid >= invoice.totalAmount) {
      invoice.status = 'Paid';
    } else if (totalPaid > 0) {
      invoice.status = 'Partially Paid';
    } else {
      invoice.status = 'Unpaid';
    }
    await invoice.save();

    // Sync payment status to linked booking items
    if (invoice.status === 'Paid' || invoice.status === 'Partially Paid') {
      for (let item of invoice.items) {
        if (item.linkedItemId) {
          try {
            if      (item.linkedItemType === 'Ticket') await Ticket.findByIdAndUpdate(item.linkedItemId, { paymentStatus: invoice.status });
            else if (item.linkedItemType === 'Visa')   await VisaApplication.findByIdAndUpdate(item.linkedItemId, { paymentStatus: invoice.status });
            else if (item.linkedItemType === 'Tour')   await TourBooking.findByIdAndUpdate(item.linkedItemId, { paymentStatus: invoice.status });
            else if (item.linkedItemType === 'Cargo')  await Cargo.findByIdAndUpdate(item.linkedItemId, { paymentStatus: invoice.status });
          } catch (err) {
            console.error('Failed to sync payment status for linked item via Stripe confirm:', err);
          }
        }
      }
    }

    res.status(200).json({ message: 'Payment confirmed successfully', payment: savedPayment });
  } catch (error) {
    console.error('Stripe Confirm Payment Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

export default router;
