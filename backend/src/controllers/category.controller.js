const Category = require('../models/Category.model');
const { asyncHandler } = require('../middleware/error.middleware');
const { AppError } = require('../middleware/error.middleware');
const logger = require('../utils/logger');

/**
 * @desc    Create category
 * @route   POST /api/v1/categories
 * @access  Private/Admin
 */
const createCategory = asyncHandler(async (req, res, next) => {
  const { name, icon, order } = req.body;

  // Check if category with same name exists
  const existingCategory = await Category.findOne({
    $or: [
      { 'name.uz': name.uz },
      { 'name.ru': name.ru }
    ]
  });

  if (existingCategory) {
    return next(new AppError('Category with this name already exists', 400));
  }

  // Create category
  const category = await Category.create({
    name,
    icon,
    order: order || 0
  });

  logger.info(`New category created: ${name.uz}`);

  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    data: { category }
  });
});

/**
 * @desc    Get all categories
 * @route   GET /api/v1/categories
 * @access  Public
 */
const getAllCategories = asyncHandler(async (req, res, next) => {
  const { isActive } = req.query;

  // Build query
  const query = {};
  if (typeof isActive !== 'undefined') {
    query.isActive = isActive === 'true';
  }

  const categories = await Category.find(query)
    .sort({ order: 1, 'name.uz': 1 });

  res.status(200).json({
    success: true,
    count: categories.length,
    data: { categories }
  });
});

/**
 * @desc    Get category by ID
 * @route   GET /api/v1/categories/:id
 * @access  Public
 */
const getCategoryById = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new AppError('Category not found', 404));
  }

  res.status(200).json({
    success: true,
    data: { category }
  });
});

/**
 * @desc    Update category
 * @route   PUT /api/v1/categories/:id
 * @access  Private/Admin
 */
const updateCategory = asyncHandler(async (req, res, next) => {
  let category = await Category.findById(req.params.id);

  if (!category) {
    return next(new AppError('Category not found', 404));
  }

  const { name, icon, order, isActive } = req.body;

  // Update fields
  if (name) category.name = name;
  if (icon) category.icon = icon;
  if (typeof order !== 'undefined') category.order = order;
  if (typeof isActive !== 'undefined') category.isActive = isActive;

  await category.save();

  logger.info(`Category updated: ${category._id}`);

  res.status(200).json({
    success: true,
    message: 'Category updated successfully',
    data: { category }
  });
});

/**
 * @desc    Delete category
 * @route   DELETE /api/v1/categories/:id
 * @access  Private/Admin
 */
const deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new AppError('Category not found', 404));
  }

  // Check if category is used by any products
  const Product = require('../models/Product.model');
  const productsCount = await Product.countDocuments({ category: category._id });

  if (productsCount > 0) {
    return next(new AppError(
      `Cannot delete category. ${productsCount} products are using this category`, 
      400
    ));
  }

  await category.deleteOne();

  logger.info(`Category deleted: ${category._id}`);

  res.status(200).json({
    success: true,
    message: 'Category deleted successfully'
  });
});

/**
 * @desc    Toggle category active status
 * @route   PUT /api/v1/categories/:id/toggle
 * @access  Private/Admin
 */
const toggleCategoryStatus = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new AppError('Category not found', 404));
  }

  category.isActive = !category.isActive;
  await category.save();

  res.status(200).json({
    success: true,
    message: `Category is now ${category.isActive ? 'active' : 'inactive'}`,
    data: { category }
  });
});

/**
 * @desc    Reorder categories
 * @route   PUT /api/v1/categories/reorder
 * @access  Private/Admin
 */
const reorderCategories = asyncHandler(async (req, res, next) => {
  const { categoryOrders } = req.body; // Array of { id, order }

  if (!Array.isArray(categoryOrders)) {
    return next(new AppError('categoryOrders must be an array', 400));
  }

  // Update each category's order
  const updatePromises = categoryOrders.map(({ id, order }) => {
    return Category.findByIdAndUpdate(id, { order }, { new: true });
  });

  await Promise.all(updatePromises);

  logger.info('Categories reordered');

  // Get updated list
  const categories = await Category.find().sort({ order: 1 });

  res.status(200).json({
    success: true,
    message: 'Categories reordered successfully',
    data: { categories }
  });
});

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
  reorderCategories
};
