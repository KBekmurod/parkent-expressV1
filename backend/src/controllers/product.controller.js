const Product = require('../models/Product.model');
const Vendor = require('../models/Vendor.model');
const { asyncHandler } = require('../middleware/error.middleware');
const { AppError } = require('../middleware/error.middleware');
const { deleteFile, processUploadedImage } = require('../utils/fileUpload');
const logger = require('../utils/logger');

/**
 * @desc    Create product
 * @route   POST /api/v1/products
 * @access  Private (Vendor or Admin)
 */
const createProduct = asyncHandler(async (req, res, next) => {
  const { vendor, name, description, price, category, preparationTime, discount } = req.body;

  // Check if vendor exists
  const vendorExists = await Vendor.findById(vendor);
  if (!vendorExists) {
    return next(new AppError('Vendor not found', 404));
  }

  // Create product
  const product = await Product.create({
    vendor,
    name,
    description,
    price,
    category,
    preparationTime,
    discount: discount || 0
  });

  logger.info(`New product created: ${name.uz} by vendor ${vendor}`);

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: { product }
  });
});

/**
 * @desc    Upload product photo
 * @route   POST /api/v1/products/:id/photo
 * @access  Private (Vendor or Admin)
 */
const uploadPhoto = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  if (!req.file) {
    return next(new AppError('Please upload a file', 400));
  }

  // Delete old photo if exists
  if (product.photo) {
    await deleteFile(product.photo);
  }

  // Process and compress image
  const { originalPath } = await processUploadedImage(req.file.path, {
    width: 800,
    quality: 80
  });

  product.photo = originalPath;
  await product.save();

  res.status(200).json({
    success: true,
    message: 'Photo uploaded successfully',
    data: { product }
  });
});

/**
 * @desc    Get all products
 * @route   GET /api/v1/products
 * @access  Public
 */
const getAllProducts = asyncHandler(async (req, res, next) => {
  const { vendor, category, search, isAvailable, page = 1, limit = 20 } = req.query;

  // Build query
  const query = {};
  if (vendor) query.vendor = vendor;
  if (category) query.category = category;
  if (typeof isAvailable !== 'undefined') query.isAvailable = isAvailable === 'true';
  if (search) {
    query.$or = [
      { 'name.uz': { $regex: search, $options: 'i' } },
      { 'name.ru': { $regex: search, $options: 'i' } },
      { 'description.uz': { $regex: search, $options: 'i' } }
    ];
  }

  // Pagination
  const skip = (page - 1) * limit;
  const total = await Product.countDocuments(query);

  const products = await Product.find(query)
    .populate('vendor', 'name logo rating')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    data: { products }
  });
});

/**
 * @desc    Get products by vendor
 * @route   GET /api/v1/products/vendor/:vendorId
 * @access  Public
 */
const getProductsByVendor = asyncHandler(async (req, res, next) => {
  const { category, isAvailable } = req.query;

  const query = { vendor: req.params.vendorId };
  if (category) query.category = category;
  if (typeof isAvailable !== 'undefined') query.isAvailable = isAvailable === 'true';

  const products = await Product.find(query)
    .sort({ category: 1, createdAt: -1 });

  res.status(200).json({
    success: true,
    count: products.length,
    data: { products }
  });
});

/**
 * @desc    Get product by ID
 * @route   GET /api/v1/products/:id
 * @access  Public
 */
const getProductById = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id)
    .populate('vendor', 'name logo rating address phone');

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  res.status(200).json({
    success: true,
    data: { product }
  });
});

/**
 * @desc    Update product
 * @route   PUT /api/v1/products/:id
 * @access  Private (Vendor or Admin)
 */
const updateProduct = asyncHandler(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  const { name, description, price, category, preparationTime, discount, isAvailable } = req.body;

  // Update fields
  if (name) product.name = name;
  if (description) product.description = description;
  if (price) product.price = price;
  if (category) product.category = category;
  if (preparationTime) product.preparationTime = preparationTime;
  if (typeof discount !== 'undefined') product.discount = discount;
  if (typeof isAvailable !== 'undefined') product.isAvailable = isAvailable;

  await product.save();

  res.status(200).json({
    success: true,
    message: 'Product updated successfully',
    data: { product }
  });
});

/**
 * @desc    Toggle product availability
 * @route   PUT /api/v1/products/:id/toggle
 * @access  Private (Vendor or Admin)
 */
const toggleAvailability = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  product.isAvailable = !product.isAvailable;
  await product.save();

  res.status(200).json({
    success: true,
    message: `Product is now ${product.isAvailable ? 'available' : 'unavailable'}`,
    data: { product }
  });
});

/**
 * @desc    Delete product
 * @route   DELETE /api/v1/products/:id
 * @access  Private (Vendor or Admin)
 */
const deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  // Delete photo if exists
  if (product.photo) {
    await deleteFile(product.photo);
  }

  await product.deleteOne();

  logger.info(`Product deleted: ${product._id}`);

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully'
  });
});

module.exports = {
  createProduct,
  uploadPhoto,
  getAllProducts,
  getProductsByVendor,
  getProductById,
  updateProduct,
  toggleAvailability,
  deleteProduct
};
