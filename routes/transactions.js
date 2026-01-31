const express = require('express');
const {
  createTransaction,
  getTransactions,
  getTransaction,
  getTransactionsByOrder
} = require('../controllers/transactionController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getTransactions)
  .post(authorize('admin'), createTransaction);

router.get('/:id', getTransaction);
router.get('/order/:orderId', getTransactionsByOrder);

module.exports = router;
