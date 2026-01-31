const express = require('express');
const router = express.Router();
const {
  createProduct,
  uploadPhoto,
  getAllProducts,
  getProductsByVendor,
  getProductById,
  updateProduct,
  toggleAvailability,
  deleteProduct
} = require('../controllers/product.controller');
const { protect, adminAuth } = require('../middleware/auth.middleware');
const { validate, validateObjectId } = require('../middleware/validation.middleware');
const { productSchemas } = require('../utils/validators');
const { uploadSingle } = require('../middleware/upload.middleware');

// Public routes
router.get('/', getAllProducts);
router.get('/vendor/:vendorId', validateObjectId('vendorId'), getProductsByVendor);
router.get('/:id', validateObjectId('id'), getProductById);

// Vendor/Admin routes
router.post('/', protect, validate(productSchemas.create), createProduct);
router.post('/:id/photo', protect, validateObjectId('id'), uploadSingle('photo'), uploadPhoto);
router.put('/:id', protect, validateObjectId('id'), validate(productSchemas.update), updateProduct);
router.put('/:id/toggle', protect, validateObjectId('id'), toggleAvailability);
router.delete('/:id', protect, validateObjectId('id'), deleteProduct);

module.exports = router;
