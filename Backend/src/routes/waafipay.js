import express from 'express';
import Payment from '../models/Payment.js';
import Invoice from '../models/Invoice.js';
import Ticket from '../models/Ticket.js';
import VisaApplication from '../models/VisaApplication.js';
import TourBooking from '../models/TourBooking.js';
import Cargo from '../models/Cargo.js';

const router = express.Router();

// @route   POST /api/waafipay/webhook
// @desc    Handle asynchronous payment callback from WaafiPay (or simulated locally)
// @access  Public (WaafiPay server)
router.post('/webhook', async (req, res) => {
  try {
    console.log('🔔 WaafiPay Webhook received:', JSON.stringify(req.body, null, 2));

    const { responseCode, params, merchantUid } = req.body;

    // Security Validation: Ensure webhook is genuinely from WaafiPay for our merchant
    if (merchantUid !== process.env.WAAFIPAY_MERCHANT_UID) {
      console.warn('⚠️  Unauthorized webhook source:', merchantUid);
      return res.status(403).json({ message: 'Unauthorized webhook source' });
    }

    if (!params || !params.referenceId) {
      return res.status(400).json({ message: 'Invalid payload: missing params.referenceId' });
    }

    const { referenceId, state, transactionId } = params;
    console.log(`📋 Webhook: ref=${referenceId} state=${state} txn=${transactionId}`);

    // Find the pending payment by reference ID
    const payment = await Payment.findOne({ reference: referenceId, status: 'Pending' });

    if (!payment) {
      console.warn(`⚠️  No pending payment found for referenceId: ${referenceId}`);
      return res.status(404).json({ message: 'Pending payment not found for this reference' });
    }

    // Process WaafiPay state
    if (responseCode === '2001' && (state === 'APPROVED' || state === 'COMPLETED')) {

      // EVC Plus / mwallet_account is a SINGLE-STEP payment flow.
      // Money is fully captured when the user enters their PIN.
      // NO API_PURCHASE_COMMIT is needed or supported — doing so causes a "Bad Request" error.
      payment.status = 'Completed';
      if (transactionId) payment.waafiTransactionId = transactionId;
      console.log(`✅ Payment ${payment._id} → Completed (txn: ${transactionId})`);

    } else {
      console.warn(`⚠️  Payment rejected: responseCode=${responseCode} state=${state}`);
      payment.status = 'Failed';
    }

    await payment.save();

    // If payment completed, update the associated invoice and all linked booking items
    if (payment.status === 'Completed' && payment.invoice) {
      const invoice = await Invoice.findById(payment.invoice);

      if (invoice) {
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
        console.log(`📄 Invoice ${invoice._id} → ${invoice.status} (paid: ${totalPaid} / ${invoice.totalAmount})`);

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
                console.error('Failed to sync payment status for linked item via webhook:', err);
              }
            }
          }
        }
      }
    }

    // Always respond 200 so WaafiPay knows we received the callback
    res.status(200).json({ message: 'Webhook received successfully', status: payment.status });
  } catch (error) {
    console.error('WaafiPay Webhook Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

export default router;
