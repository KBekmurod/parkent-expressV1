const express = require('express');
const router = express.Router();
const {
  createCardPayment,
  uploadReceipt,
  verifyPayment,
  rejectPayment,
  getDriverPayments,
  getPendingSettlements,
  markAsSettled,
  getCardPaymentById,
  getAllCardPayments
} = require('../controllers/cardPayment.controller');
const { protect, adminAuth } = require('../middleware/auth.middleware');
const { receiptUpload } = require('../middleware/receiptUpload.middleware');
const { uploadLimiter } = require('../middleware/rateLimit.middleware');

// Public routes (Bot access with rate limiting)
router.post('/', createCardPayment);
router.post('/:id/receipt', uploadLimiter, receiptUpload, uploadReceipt);
router.get('/driver/:driverId', getDriverPayments);

// Admin routes
router.get('/settlements/pending', protect, adminAuth, getPendingSettlements);
router.get('/', protect, adminAuth, getAllCardPayments);
router.get('/:id', getCardPaymentById);
router.put('/:id/verify', protect, adminAuth, verifyPayment);
router.put('/:id/reject', protect, adminAuth, rejectPayment);
router.put('/:id/settle', protect, adminAuth, markAsSettled);

module.exports = router;
