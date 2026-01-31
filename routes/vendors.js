const express = require('express');
const {
  createVendor,
  getVendors,
  getVendor,
  updateVendor,
  deleteVendor,
  addProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/vendorController');
const { protect, authorize } = require('../middlewares/auth');
const { validate, vendorSchema, productSchema } = require('../middlewares/validator');

const router = express.Router();

router.route('/')
  .get(getVendors)
  .post(protect, authorize('vendor', 'admin'), validate(vendorSchema), createVendor);

router.route('/:id')
  .get(getVendor)
  .put(protect, authorize('vendor', 'admin'), updateVendor)
  .delete(protect, authorize('vendor', 'admin'), deleteVendor);

router.route('/:id/products')
  .post(protect, authorize('vendor', 'admin'), validate(productSchema), addProduct);

router.route('/:vendorId/products/:productId')
  .put(protect, authorize('vendor', 'admin'), validate(productSchema), updateProduct)
  .delete(protect, authorize('vendor', 'admin'), deleteProduct);

module.exports = router;
