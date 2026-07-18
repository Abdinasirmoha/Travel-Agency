import express from 'express';
import bcrypt from 'bcryptjs';
import Customer from '../models/Customer.js';
import Flight from '../models/Flight.js';
import Ticket from '../models/Ticket.js';
import VisaType from '../models/VisaType.js';
import VisaApplication from '../models/VisaApplication.js';
import TouristPackage from '../models/TouristPackage.js';
import TourBooking from '../models/TourBooking.js';
import Cargo from '../models/Cargo.js';
import Invoice from '../models/Invoice.js';
import Payment from '../models/Payment.js';
import Expense from '../models/Expense.js';
import Role from '../models/Role.js';
import User from '../models/User.js';
import { sendCustomerEmail } from '../utils/mailer.js';
import Notification from '../models/Notification.js';

const router = express.Router();

// Dashboard Stats
router.get('/dashboard-stats', async (req, res) => {
  try {
    const totalCustomers = await Customer.countDocuments();
    const todayFlights = await Flight.countDocuments({
      departureTime: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999))
      }
    });
    
    // Mocking revenue and other stats for now
    res.json({
      totalCustomers: totalCustomers || 2842,
      todayBookings: 48,
      todayFlights: todayFlights || 156,
      monthlyRevenue: 428500,
      monthlyBookingsAndRevenue: [
        { month: 'Jun', bookings: 12000, revenue: 120000 },
        { month: 'Jul', bookings: 19000, revenue: 190000 },
        { month: 'Aug', bookings: 15000, revenue: 150000 },
        { month: 'Sep', bookings: 25000, revenue: 250000 },
        { month: 'Oct', bookings: 22000, revenue: 220000 },
        { month: 'Nov', bookings: 30000, revenue: 300000 }
      ],
      upcomingFlights: [
        { client: 'John Doe', route: 'NYC -> LDN', departure: 'Oct 24, 2023 10:30 AM', status: 'ON TIME' },
        { client: 'Sarah Miller', route: 'DXB -> BOM', departure: 'Oct 24, 2023 02:15 PM', status: 'ON TIME' },
        { client: 'Robert King', route: 'PAR -> ROM', departure: 'Oct 25, 2023 08:00 AM', status: 'DELAYED' }
      ]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Settings - Send Email
router.post('/settings/send-email', async (req, res) => {
  try {
    const { customerIds, message } = req.body;
    
    if (!customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
      return res.status(400).json({ message: 'No customers selected' });
    }
    
    if (!message) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    // Fetch customers from DB to get their emails
    const customers = await Customer.find({ _id: { $in: customerIds } });
    
    if (customers.length === 0) {
      return res.status(404).json({ message: 'No valid customers found' });
    }

    // Send emails
    const sendPromises = customers.map(customer => {
      if (!customer.email) return Promise.resolve(null);
      
      return sendCustomerEmail({
        to: customer.email,
        subject: 'Message from EliteTravel Pro',
        text: message
      }).catch(err => {
        console.error(`Failed to send email to ${customer.email}:`, err);
        return null; // Don't crash the whole batch if one fails
      });
    });

    await Promise.all(sendPromises);

    res.json({ message: `Successfully sent email to ${customers.length} customer(s)` });
  } catch (error) {
    console.error('Error in send-email endpoint:', error);
    res.status(500).json({ message: 'Failed to send emails' });
  }
});

// Customer Login (client website)
router.post('/customers/login', async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const passportNo = req.body.passportNo?.trim();
    if (!email || !passportNo) {
      return res.status(400).json({ message: 'Email and passport number are required' });
    }
    const customer = await Customer.findOne({
      email: { $regex: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
    });
    if (!customer || customer.passportNo.trim().toLowerCase() !== passportNo.toLowerCase()) {
      return res.status(401).json({ message: 'Invalid email or passport number' });
    }
    if (customer.status === 'Inactive') {
      return res.status(403).json({ message: 'Account is inactive. Please contact support.' });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Customers GET
router.get('/customers', async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Customers POST
router.post('/customers', async (req, res) => {
  try {
    const data = {
      ...req.body,
      email: req.body.email?.trim().toLowerCase(),
      passportNo: req.body.passportNo?.trim(),
      name: req.body.name?.trim(),
    };
    const newCustomer = new Customer(data);
    const savedCustomer = await newCustomer.save();
    res.status(201).json(savedCustomer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Customers PUT
router.put('/customers/:id', async (req, res) => {
  try {
    const updatedCustomer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedCustomer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Customers DELETE
router.delete('/customers/:id', async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.params.id);
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Flights
router.get('/flights', async (req, res) => {
  try {
    const flights = await Flight.find();
    res.json(flights);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/flights', async (req, res) => {
  try {
    const newFlight = new Flight(req.body);
    const savedFlight = await newFlight.save();
    res.status(201).json(savedFlight);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/flights/:id', async (req, res) => {
  try {
    const updatedFlight = await Flight.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedFlight);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/flights/:id', async (req, res) => {
  try {
    await Flight.findByIdAndDelete(req.params.id);
    res.json({ message: 'Flight deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Tickets
router.get('/tickets', async (req, res) => {
  try {
    const tickets = await Ticket.find().populate('flightDetails').populate('customer');
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/tickets', async (req, res) => {
  try {
    const newTicket = new Ticket(req.body);
    const savedTicket = await newTicket.save();
    
    if (req.body.isOnline) {
      await Notification.create({
        title: 'New Online Ticket Booking',
        message: `A customer has booked an online flight ticket.`,
        type: 'Ticket',
        referenceId: savedTicket._id
      });
    }
    
    // Auto-generate invoice
    if (savedTicket.paymentStatus !== 'Paid') {
      const newInvoice = new Invoice({
        invoiceNumber: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
        customer: savedTicket.customer,
        dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
        items: [{
          description: `Flight Ticket - ${savedTicket.passengerName}`,
          amount: (savedTicket.price || 0) + (savedTicket.profit || 0) - (savedTicket.discount || 0),
          linkedItemId: savedTicket._id,
          linkedItemType: 'Ticket'
        }],
        totalAmount: (savedTicket.price || 0) + (savedTicket.profit || 0) - (savedTicket.discount || 0),
        status: 'Unpaid'
      });
      await newInvoice.save();
    }

    res.status(201).json(await savedTicket.populate(['customer', 'flightDetails']));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/tickets/:id', async (req, res) => {
  try {
    const updatedTicket = await Ticket.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate(['flightDetails', 'customer']);
    res.json(updatedTicket);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/tickets/:id', async (req, res) => {
  try {
    await Ticket.findByIdAndDelete(req.params.id);
    res.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Visa Types
router.get('/visa-types', async (req, res) => {
  try {
    const visaTypes = await VisaType.find();
    res.json(visaTypes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/visa-types', async (req, res) => {
  try {
    const newVisaType = new VisaType(req.body);
    const savedVisaType = await newVisaType.save();
    res.status(201).json(savedVisaType);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/visa-types/:id', async (req, res) => {
  try {
    const updatedVisaType = await VisaType.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedVisaType);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/visa-types/:id', async (req, res) => {
  try {
    await VisaType.findByIdAndDelete(req.params.id);
    res.json({ message: 'VisaType deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Visa Applications
router.get('/visa-applications', async (req, res) => {
  try {
    const visaApps = await VisaApplication.find().populate('customer').populate('visaType');
    res.json(visaApps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/visa-applications', async (req, res) => {
  try {
    const newVisaApp = new VisaApplication(req.body);
    const savedVisaApp = await newVisaApp.save();

    if (req.body.isOnline) {
      await Notification.create({
        title: 'New Online Visa Application',
        message: `A customer has applied for a visa online.`,
        type: 'Visa',
        referenceId: savedVisaApp._id
      });
    }

    // Auto-generate invoice
    if (savedVisaApp.paymentStatus !== 'Paid') {
      const newInvoice = new Invoice({
        invoiceNumber: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
        customer: savedVisaApp.customer,
        dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
        items: [{
          description: `Visa Application`,
          amount: savedVisaApp.totalAmount || 0,
          linkedItemId: savedVisaApp._id,
          linkedItemType: 'Visa'
        }],
        totalAmount: savedVisaApp.totalAmount || 0,
        status: 'Unpaid'
      });
      await newInvoice.save();
    }

    res.status(201).json(await savedVisaApp.populate(['customer', 'visaType']));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/visa-applications/:id', async (req, res) => {
  try {
    const updatedVisaApp = await VisaApplication.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate(['customer', 'visaType']);
    res.json(updatedVisaApp);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/visa-applications/:id', async (req, res) => {
  try {
    await VisaApplication.findByIdAndDelete(req.params.id);
    res.json({ message: 'VisaApplication deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Tour Packages
router.get('/tour-packages', async (req, res) => {
  try {
    const packages = await TouristPackage.find();
    res.json(packages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/tour-packages', async (req, res) => {
  try {
    const newPackage = new TouristPackage(req.body);
    const savedPackage = await newPackage.save();
    res.status(201).json(savedPackage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/tour-packages/:id', async (req, res) => {
  try {
    const updatedPackage = await TouristPackage.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedPackage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/tour-packages/:id', async (req, res) => {
  try {
    await TouristPackage.findByIdAndDelete(req.params.id);
    res.json({ message: 'TouristPackage deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Tour Bookings
router.get('/tour-bookings', async (req, res) => {
  try {
    const bookings = await TourBooking.find().populate('customer').populate('package');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/tour-bookings', async (req, res) => {
  try {
    const newBooking = new TourBooking(req.body);
    const savedBooking = await newBooking.save();

    if (req.body.isOnline) {
      await Notification.create({
        title: 'New Online Tour Booking',
        message: `A customer has booked a tour package online.`,
        type: 'Tour',
        referenceId: savedBooking._id
      });
    }

    // Auto-generate invoice
    if (savedBooking.paymentStatus !== 'Paid') {
      const newInvoice = new Invoice({
        invoiceNumber: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
        customer: savedBooking.customer,
        dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
        items: [{
          description: `Tour Booking`,
          amount: savedBooking.totalAmount || 0,
          linkedItemId: savedBooking._id,
          linkedItemType: 'Tour'
        }],
        totalAmount: savedBooking.totalAmount || 0,
        status: 'Unpaid'
      });
      await newInvoice.save();
    }

    res.status(201).json(await savedBooking.populate(['customer', 'package']));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/tour-bookings/:id', async (req, res) => {
  try {
    const updatedBooking = await TourBooking.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate(['customer', 'package']);
    res.json(updatedBooking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/tour-bookings/:id', async (req, res) => {
  try {
    await TourBooking.findByIdAndDelete(req.params.id);
    res.json({ message: 'TourBooking deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Cargo
router.get('/cargo', async (req, res) => {
  try {
    const cargo = await Cargo.find().populate('sender');
    res.json(cargo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/cargo', async (req, res) => {
  try {
    const newCargo = new Cargo(req.body);
    const savedCargo = await newCargo.save();

    // Auto-generate invoice
    if (savedCargo.paymentStatus !== 'Paid') {
      const newInvoice = new Invoice({
        invoiceNumber: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
        customer: savedCargo.sender,
        dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
        items: [{
          description: `Cargo Shipment - ${savedCargo.origin} to ${savedCargo.destination}`,
          amount: savedCargo.totalAmount || 0,
          linkedItemId: savedCargo._id,
          linkedItemType: 'Cargo'
        }],
        totalAmount: savedCargo.totalAmount || 0,
        status: 'Unpaid'
      });
      await newInvoice.save();
    }

    res.status(201).json(await savedCargo.populate('sender'));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/cargo/:id', async (req, res) => {
  try {
    const updatedCargo = await Cargo.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('sender');
    res.json(updatedCargo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/cargo/:id', async (req, res) => {
  try {
    await Cargo.findByIdAndDelete(req.params.id);
    res.json({ message: 'Cargo deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Invoices
router.get('/invoices', async (req, res) => {
  try {
    const invoices = await Invoice.find().populate('customer').sort({ date: -1 });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/invoices', async (req, res) => {
  try {
    const newInvoice = new Invoice(req.body);
    const savedInvoice = await newInvoice.save();
    res.status(201).json(await savedInvoice.populate('customer'));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/invoices/:id', async (req, res) => {
  try {
    const updatedInvoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('customer');
    res.json(updatedInvoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/invoices/:id', async (req, res) => {
  try {
    await Invoice.findByIdAndDelete(req.params.id);
    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Payments
router.get('/payments', async (req, res) => {
  try {
    const payments = await Payment.find().populate('customer').populate('invoice').sort({ paymentDate: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/payments', async (req, res) => {
  try {
    const { paymentMethod, payerAccountNo: rawAccountNo, amountPaid, reference, invoice, currency } = req.body;

    let savedPayment;

    if (paymentMethod === 'Mobile Money') {
      // ── Mobile Money: go through WaafiPay ──────────────────────────────────
      if (!rawAccountNo) {
        return res.status(400).json({ message: 'Mobile Money Phone Number is required.' });
      }

      // Sanitize phone number
      let payerAccountNo = String(rawAccountNo).replace(/[\s\-().+]/g, '');
      if (payerAccountNo.startsWith('0'))        payerAccountNo = '252' + payerAccountNo.slice(1);
      else if (!payerAccountNo.startsWith('252')) payerAccountNo = '252' + payerAccountNo;

      if (!/^252[0-9]{8,9}$/.test(payerAccountNo)) {
        return res.status(400).json({
          message: `Invalid phone number format. Please enter a valid Somali mobile wallet number (e.g. 252615123456). Got: ${payerAccountNo}`
        });
      }
      console.log(`📱 Sanitized phone: ${rawAccountNo} → ${payerAccountNo}`);

      const referenceId = reference || `REF-${Date.now()}`;
      const invoiceId   = req.body.invoice ? String(req.body.invoice) : `INV-${Date.now()}`;

      const waafiPayload = {
        schemaVersion: "1.0",
        requestId: `${Date.now()}`,
        timestamp: `${Date.now()}`,
        channelName: "WEB",
        serviceName: "API_PURCHASE",
        serviceParams: {
          merchantUid:   process.env.WAAFIPAY_MERCHANT_UID,
          apiUserId:     process.env.WAAFIPAY_API_USER_ID,
          apiKey:        process.env.WAAFIPAY_API_KEY,
          paymentMethod: "mwallet_account",
          payerInfo: { accountNo: payerAccountNo },
          transactionInfo: {
            referenceId, invoiceId,
            amount:      Number(amountPaid),
            currency:    currency || "USD",
            description: `Travel Agency Payment - ${invoiceId}`
          }
        }
      };

      console.log('📤 Sending WaafiPay Request:', JSON.stringify(waafiPayload, null, 2));
      let waafiTransactionId = null;
      try {
        const waafiRes  = await fetch(process.env.WAAFIPAY_API_URL, { 
          method: 'POST', 
          headers: { 
            'Content-Type': 'application/json',
            'User-Agent': 'EliteTravel-App/1.0 (Node.js)'
          }, 
          body: JSON.stringify(waafiPayload) 
        });
        const waafiData = await waafiRes.json();
        console.log('📥 WaafiPay Response:', JSON.stringify(waafiData, null, 2));
        if (waafiData.responseCode !== '2001') {
          return res.status(400).json({ message: `WaafiPay: ${waafiData.responseMsg || waafiData.errorCode || 'Transaction Failed. Please try again.'}` });
        }
        if (waafiData.params?.transactionId) waafiTransactionId = waafiData.params.transactionId;
      } catch (err) {
        console.error('WaafiPay API Request Failed:', err);
        return res.status(500).json({ message: 'Payment Gateway unreachable. Please try again.' });
      }

      const newPayment = new Payment({
        receiptNumber: req.body.receiptNumber,
        invoice:       req.body.invoice || null,
        customer:      req.body.customer,
        amountPaid:    Number(amountPaid),
        paymentDate:   req.body.paymentDate || new Date(),
        paymentMethod: 'Mobile Money',
        payerAccountNo,
        reference:     referenceId,
        currency:      currency || 'USD',
        status:        'Pending',
        waafiTransactionId
      });
      savedPayment = await newPayment.save();
      console.log(`✅ Payment saved with status: ${savedPayment.status} | ref: ${savedPayment.reference}`);

      // Simulate webhook in dev (7 second delay)
      setTimeout(async () => {
        try {
          const webhookUrl = `http://localhost:${process.env.PORT || 5001}/api/waafipay/webhook`;
          console.log(`⏱️  Simulating WaafiPay webhook in 7s → ${webhookUrl}`);
          const simRes  = await fetch(webhookUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ responseCode: '2001', merchantUid: process.env.WAAFIPAY_MERCHANT_UID, params: { referenceId: savedPayment.reference, state: 'APPROVED', transactionId: waafiTransactionId || `TXN-${Date.now()}` } }) });
          console.log('🔔 Simulated Webhook Response:', await simRes.json());
        } catch(e) { console.error('Simulated webhook failed:', e); }
      }, 7000);

    } else {
      // ── Cash / Bank Transfer / Credit Card — admin direct payment ──────────
      const newPayment = new Payment({
        ...req.body,
        status: 'Completed'   // Admin-entered payments are always immediately Completed
      });
      savedPayment = await newPayment.save();
      console.log(`✅ Admin payment saved: ${savedPayment.receiptNumber} (${paymentMethod})`);

      // Auto-sync invoice immediately for non-mobile-money payments
      if (savedPayment.invoice) {
        await syncInvoice(savedPayment.invoice);
      }
    }

    res.status(201).json(await savedPayment.populate(['customer', 'invoice']));
  } catch (error) {
    console.error('POST /payments error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Helper: recalculate and save invoice status based on completed payments
async function syncInvoice(invoiceId) {
  try {
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) return;
    const allPayments = await Payment.find({ invoice: invoice._id, status: 'Completed' });
    const totalPaid = allPayments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
    invoice.amountPaid = totalPaid;
    if (totalPaid >= invoice.totalAmount)  invoice.status = 'Paid';
    else if (totalPaid > 0)                invoice.status = 'Partially Paid';
    else                                   invoice.status = 'Unpaid';
    await invoice.save();
    console.log(`📄 Invoice ${invoice.invoiceNumber} → ${invoice.status} (paid: ${totalPaid} / ${invoice.totalAmount})`);

    // Sync linked booking items
    if (invoice.status === 'Paid' || invoice.status === 'Partially Paid') {
      for (let item of invoice.items || []) {
        if (!item.linkedItemId) continue;
        try {
          const update = { paymentStatus: invoice.status };
          if      (item.linkedItemType === 'Ticket') await Ticket.findByIdAndUpdate(item.linkedItemId, update);
          else if (item.linkedItemType === 'Visa')   await VisaApplication.findByIdAndUpdate(item.linkedItemId, update);
          else if (item.linkedItemType === 'Tour')   await TourBooking.findByIdAndUpdate(item.linkedItemId, update);
          else if (item.linkedItemType === 'Cargo')  await Cargo.findByIdAndUpdate(item.linkedItemId, update);
        } catch (err) { console.error('Failed to sync linked item:', err); }
      }
    }
  } catch (err) { console.error('syncInvoice error:', err); }
}


router.get('/payments/:id', async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate(['customer', 'invoice']);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/payments/:id', async (req, res) => {
  try {
    const updatedPayment = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate(['customer', 'invoice']);
    if (!updatedPayment) return res.status(404).json({ message: 'Payment not found' });
    // Re-sync invoice after any payment update
    if (updatedPayment.invoice) {
      await syncInvoice(updatedPayment.invoice._id || updatedPayment.invoice);
    }
    res.json(updatedPayment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


router.delete('/payments/:id', async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    // Re-sync invoice after payment deletion so status recalculates
    if (payment?.invoice) {
      await syncInvoice(payment.invoice);
    }
    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Expenses
router.get('/expenses', async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/expenses', async (req, res) => {
  try {
    const newExpense = new Expense(req.body);
    const savedExpense = await newExpense.save();
    res.status(201).json(savedExpense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/expenses/:id', async (req, res) => {
  try {
    const updatedExpense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedExpense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/expenses/:id', async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Roles
router.get('/roles', async (req, res) => {
  try {
    const roles = await Role.find().sort({ createdAt: -1 });
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/roles', async (req, res) => {
  try {
    const newRole = new Role(req.body);
    const savedRole = await newRole.save();
    res.status(201).json(savedRole);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/roles/:id', async (req, res) => {
  try {
    const updatedRole = await Role.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedRole);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/roles/:id', async (req, res) => {
  try {
    await Role.findByIdAndDelete(req.params.id);
    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().populate('role', 'name').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/users', async (req, res) => {
  try {
    const userData = { ...req.body };
    // Hash password before saving so bcrypt.compare works on login
    if (userData.password) {
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(userData.password, salt);
    }
    const newUser = new User(userData);
    const savedUser = await newUser.save();
    res.status(201).json(await savedUser.populate('role', 'name'));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const updateData = { ...req.body };
    // Re-hash if a new password is being set
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }
    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate('role', 'name');
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// Notifications
// ==========================================
router.get('/notifications', async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(50);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/notifications/read-all', async (req, res) => {
  try {
    await Notification.updateMany({ isRead: false }, { isRead: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/notifications/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
