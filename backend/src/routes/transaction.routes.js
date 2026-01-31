const express = require('express');
const router = express.Router();
const {
  createTransaction,
  updateTransactionStatus,
  getAllTransactions,
  getTransactionById,
  getTransactionsByUser,
  getTransactionsByVendor,
  getTransactionsByDriver,
  requestPayout
} = require('../controllers/transaction.controller');
const { protect, adminAuth } = require('../middleware/auth.middleware');
const { validate, validateObjectId } = require('../middleware/validation.middleware');
const { transactionSchemas } = require('../utils/validators');

// Public routes (Telegram bot / Payment gateway)
router.post('/', validate(transactionSchemas.create), createTransaction);
router.post('/payout', validate(transactionSchemas.payout), requestPayout);
router.get('/user/:userId', validateObjectId('userId'), getTransactionsByUser);
router.get('/vendor/:vendorId', validateObjectId('vendorId'), getTransactionsByVendor);
router.get('/driver/:driverId', validateObjectId('driverId'), getTransactionsByDriver);

// Admin routes
router.get('/', protect, adminAuth, getAllTransactions);
router.get('/:id', protect, adminAuth, validateObjectId('id'), getTransactionById);
router.put('/:id/status', protect, adminAuth, validateObjectId('id'), updateTransactionStatus);

module.exports = router;
