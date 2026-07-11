import Customer from '../models/Customer.js';
import Flight from '../models/Flight.js';
import Ticket from '../models/Ticket.js';
import TourBooking from '../models/TourBooking.js';
import TouristPackage from '../models/TouristPackage.js';
import VisaApplication from '../models/VisaApplication.js';
import Invoice from '../models/Invoice.js';
import Payment from '../models/Payment.js';
import Expense from '../models/Expense.js';
import Cargo from '../models/Cargo.js';

// Helper to parse date filters
const getDateFilter = (startDate, endDate, dateField = 'createdAt') => {
  const filter = {};
  if (startDate || endDate) {
    filter[dateField] = {};
    if (startDate) filter[dateField].$gte = new Date(startDate);
    if (endDate) filter[dateField].$lte = new Date(endDate);
  }
  return filter;
};

// GET /api/reports/dashboard
export const getDashboardStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Revenue is calculated from Payments
    const paymentFilter = getDateFilter(startDate, endDate, 'paymentDate');
    const totalPayments = await Payment.aggregate([
      { $match: paymentFilter },
      { $group: { _id: null, total: { $sum: '$amountPaid' }, count: { $sum: 1 } } }
    ]);
    const totalRevenue = totalPayments[0]?.total || 0;
    const paymentCount = totalPayments[0]?.count || 0;

    // Expenses
    const expenseFilter = getDateFilter(startDate, endDate, 'date');
    const totalExpensesAgg = await Expense.aggregate([
      { $match: expenseFilter },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalExpenses = totalExpensesAgg[0]?.total || 0;
    
    // Net Profit
    const netProfit = totalRevenue - totalExpenses;

    // Customers
    const customerFilter = getDateFilter(startDate, endDate);
    const totalCustomers = await Customer.countDocuments(customerFilter);

    // Bookings (Tour + Flight)
    const tourFilter = getDateFilter(startDate, endDate, 'createdAt');
    const totalTourBookings = await TourBooking.countDocuments(tourFilter);
    const flightFilter = getDateFilter(startDate, endDate, 'createdAt');
    const totalFlights = await Ticket.countDocuments(flightFilter);
    const totalBookings = totalTourBookings + totalFlights;

    // Invoices
    const invoiceFilter = getDateFilter(startDate, endDate, 'date');
    const totalInvoicesAgg = await Invoice.aggregate([
      { $match: invoiceFilter },
      { 
        $group: { 
          _id: null, 
          count: { $sum: 1 },
          paidCount: { $sum: { $cond: [{ $eq: ['$status', 'Paid'] }, 1, 0] } },
          unpaidCount: { $sum: { $cond: [{ $ne: ['$status', 'Paid'] }, 1, 0] } }
        } 
      }
    ]);
    const invoiceStats = totalInvoicesAgg[0] || { count: 0, paidCount: 0, unpaidCount: 0 };

    // Visas
    const visaFilter = getDateFilter(startDate, endDate, 'createdAt');
    const totalVisas = await VisaApplication.countDocuments(visaFilter);

    // Packages sold
    const packagesSoldAgg = await TourBooking.aggregate([
      { $match: { ...tourFilter, status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, count: { $sum: '$numberOfPeople' } } } // count total seats sold, or just bookings? Let's use countDocuments as packages sold
    ]);

    res.json({
      totalRevenue,
      totalExpenses,
      netProfit,
      totalCustomers,
      totalBookings,
      totalInvoices: invoiceStats.count,
      paidInvoices: invoiceStats.paidCount,
      unpaidInvoices: invoiceStats.unpaidCount,
      totalPayments: paymentCount,
      totalVisas,
      totalFlights,
      totalPackagesSold: totalTourBookings
    });
  } catch (error) {
    console.error('Error generating dashboard stats:', error);
    res.status(500).json({ message: 'Error generating dashboard stats' });
  }
};

// GET /api/reports/revenue
export const getRevenueReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const paymentFilter = getDateFilter(startDate, endDate, 'paymentDate');

    const payments = await Payment.find(paymentFilter)
      .populate('customer', 'firstName lastName')
      .populate('invoice', 'invoiceNumber')
      .populate('recordedBy', 'name')
      .sort({ paymentDate: -1 });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/reports/invoices
export const getInvoicesReport = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    const filter = getDateFilter(startDate, endDate, 'date');
    if (status) filter.status = status;

    const invoices = await Invoice.find(filter)
      .populate('customer', 'firstName lastName email')
      .sort({ date: -1 });

    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/reports/payments
export const getPaymentsReport = async (req, res) => {
  try {
    const { startDate, endDate, paymentMethod } = req.query;
    const filter = getDateFilter(startDate, endDate, 'paymentDate');
    if (paymentMethod) filter.paymentMethod = paymentMethod;

    const payments = await Payment.find(filter)
      .populate('customer', 'firstName lastName')
      .populate('invoice', 'invoiceNumber')
      .sort({ paymentDate: -1 });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/reports/bookings
export const getBookingsReport = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    const filter = getDateFilter(startDate, endDate, 'createdAt');
    if (status) filter.status = status;

    const bookings = await TourBooking.find(filter)
      .populate('customer', 'firstName lastName')
      .populate('package', 'name destination')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/reports/visa
export const getVisaReport = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    const filter = getDateFilter(startDate, endDate, 'createdAt');
    if (status) filter.status = status;

    const visas = await VisaApplication.find(filter)
      .populate('customer', 'firstName lastName')
      .populate('visaType', 'name country')
      .sort({ createdAt: -1 });

    res.json(visas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/reports/charts
export const getDashboardChartsData = async (req, res) => {
  try {
    const now = new Date();
    
    // 1. Monthly Revenue & Bookings Trend (Last 6 Months)
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    
    // Aggregate Payments for Revenue Trend
    const revenueTrend = await Payment.aggregate([
      { $match: { paymentDate: { $gte: sixMonthsAgo } } },
      { 
        $group: { 
          _id: { year: { $year: "$paymentDate" }, month: { $month: "$paymentDate" } },
          total: { $sum: "$amountPaid" }
        } 
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Aggregate Tickets for Bookings Trend
    const bookingsTrend = await Ticket.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { 
        $group: { 
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          count: { $sum: 1 }
        } 
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Format Trend Data
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const trendData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth() + 1; // 1-indexed
      
      const rev = revenueTrend.find(r => r._id.year === year && r._id.month === month);
      const bkg = bookingsTrend.find(b => b._id.year === year && b._id.month === month);
      
      trendData.push({
        name: monthNames[d.getMonth()],
        revenue: rev ? rev.total : 0,
        bookings: bkg ? bkg.count : 0
      });
    }

    // 2. Services Breakdown (Visa, Tourism, Ticket, Cargo)
    const [visaCount, ticketCount, tourCount, cargoCount] = await Promise.all([
      VisaApplication.countDocuments(),
      Ticket.countDocuments(),
      TourBooking.countDocuments(),
      Cargo.countDocuments()
    ]);
    
    const formattedBookingStatus = [
      { name: 'Visa', value: visaCount },
      { name: 'Ticket', value: ticketCount },
      { name: 'Tourism', value: tourCount },
      { name: 'Cargo', value: cargoCount }
    ].filter(item => item.value > 0); // Hide zero values

    // 3. Visa Approval Status
    const visaStatus = await VisaApplication.aggregate([
      { $group: { _id: "$status", value: { $sum: 1 } } }
    ]);
    const formattedVisaStatus = visaStatus.map(v => ({ name: v._id, value: v.value }));

    // 4. Expense Breakdown
    const expenseBreakdown = await Expense.aggregate([
      { $group: { _id: "$category", value: { $sum: "$amount" } } }
    ]);
    const formattedExpenseBreakdown = expenseBreakdown.map(e => ({ name: e._id || 'Other', value: e.value }));

    res.json({
      trendData,
      bookingStatus: formattedBookingStatus.length > 0 ? formattedBookingStatus : [{name: 'None', value: 0}],
      visaStatus: formattedVisaStatus.length > 0 ? formattedVisaStatus : [{name: 'None', value: 0}],
      expenseBreakdown: formattedExpenseBreakdown.length > 0 ? formattedExpenseBreakdown : [{name: 'None', value: 0}]
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/reports/expenses
export const getExpensesReport = async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;
    const filter = getDateFilter(startDate, endDate, 'date');
    if (category) filter.category = category;

    const expenses = await Expense.find(filter)
      .populate('recordedBy', 'name')
      .sort({ date: -1 });

    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
