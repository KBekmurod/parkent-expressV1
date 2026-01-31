const express = require('express');
const router = express.Router();
const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
  reorderCategories
} = require('../controllers/category.controller');
const { protect, adminAuth } = require('../middleware/auth.middleware');
const { validate, validateObjectId } = require('../middleware/validation.middleware');
const { categorySchemas } = require('../utils/validators');

// Public routes
router.get('/', getAllCategories);
router.get('/:id', validateObjectId('id'), getCategoryById);

// Admin routes
router.post('/', protect, adminAuth, validate(categorySchemas.create), createCategory);
router.put('/reorder', protect, adminAuth, reorderCategories);
router.put('/:id', protect, adminAuth, validateObjectId('id'), validate(categorySchemas.update), updateCategory);
router.put('/:id/toggle', protect, adminAuth, validateObjectId('id'), toggleCategoryStatus);
router.delete('/:id', protect, adminAuth, validateObjectId('id'), deleteCategory);

module.exports = router;
