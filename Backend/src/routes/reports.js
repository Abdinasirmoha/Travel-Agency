import express from 'express';
import {
  getDashboardStats,
  getRevenueReport,
  getInvoicesReport,
  getPaymentsReport,
  getBookingsReport,
  getVisaReport,
  getExpensesReport,
  getDashboardChartsData
} from '../controllers/reportController.js';

const router = express.Router();

router.get('/dashboard', getDashboardStats);
router.get('/charts', getDashboardChartsData);
router.get('/revenue', getRevenueReport);
router.get('/invoices', getInvoicesReport);
router.get('/payments', getPaymentsReport);
router.get('/bookings', getBookingsReport);
router.get('/visa', getVisaReport);
router.get('/expenses', getExpensesReport);

export default router;
