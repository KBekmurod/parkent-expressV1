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
  getCardPaymentById
} = require('../controllers/cardPayment.controller');
const { protect, adminAuth } = require('../middleware/auth.middleware');
const { receiptUpload } = require('../middleware/receiptUpload.middleware');

// Public routes (Bot access)
router.post('/', createCardPayment);
router.post('/:id/receipt', receiptUpload, uploadReceipt);
router.get('/driver/:driverId', getDriverPayments);
router.get('/:id', getCardPaymentById);

// Admin routes
router.get('/settlements/pending', protect, adminAuth, getPendingSettlements);
router.put('/:id/verify', protect, adminAuth, verifyPayment);
router.put('/:id/reject', protect, adminAuth, rejectPayment);
router.put('/:id/settle', protect, adminAuth, markAsSettled);

module.exports = router;
