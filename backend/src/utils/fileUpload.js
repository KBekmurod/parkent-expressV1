const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
const logger = require('./logger');

/**
 * Compress and optimize image using Sharp
 * @param {string} filePath - Path to image file
 * @param {object} options - Compression options
 */
const compressImage = async (filePath, options = {}) => {
  try {
    const {
      width = 1200,
      quality = 80,
      format = 'jpeg'
    } = options;

    const outputPath = filePath.replace(path.extname(filePath), `.${format}`);

    await sharp(filePath)
      .resize(width, null, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality, progressive: true })
      .toFile(outputPath);

    // If output format is different, delete original
    if (outputPath !== filePath) {
      await fs.unlink(filePath);
    }

    return outputPath;
  } catch (error) {
    logger.error('Image compression error:', error);
    throw new Error('Failed to compress image');
  }
};

/**
 * Compress image for thumbnail
 * @param {string} filePath - Path to image file
 */
const createThumbnail = async (filePath) => {
  try {
    const thumbnailPath = filePath.replace(
      path.extname(filePath),
      `-thumb${path.extname(filePath)}`
    );

    await sharp(filePath)
      .resize(300, 300, {
        fit: 'cover'
      })
      .jpeg({ quality: 70 })
      .toFile(thumbnailPath);

    return thumbnailPath;
  } catch (error) {
    logger.error('Thumbnail creation error:', error);
    throw new Error('Failed to create thumbnail');
  }
};

/**
 * Delete file from storage
 * @param {string} filePath - Path to file
 */
const deleteFile = async (filePath) => {
  try {
    // Check if file exists
    await fs.access(filePath);
    
    // Delete file
    await fs.unlink(filePath);
    
    logger.info(`File deleted: ${filePath}`);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File doesn't exist
      logger.warn(`File not found: ${filePath}`);
      return false;
    }
    logger.error('File deletion error:', error);
    throw new Error('Failed to delete file');
  }
};

/**
 * Delete multiple files
 * @param {Array} filePaths - Array of file paths
 */
const deleteFiles = async (filePaths) => {
  try {
    const deletePromises = filePaths.map(filePath => deleteFile(filePath));
    await Promise.all(deletePromises);
    return true;
  } catch (error) {
    logger.error('Multiple files deletion error:', error);
    throw new Error('Failed to delete files');
  }
};

/**
 * Get file size in MB
 * @param {string} filePath - Path to file
 */
const getFileSize = async (filePath) => {
  try {
    const stats = await fs.stat(filePath);
    return (stats.size / (1024 * 1024)).toFixed(2); // MB
  } catch (error) {
    logger.error('Get file size error:', error);
    return null;
  }
};

/**
 * Validate file type
 * @param {string} filePath - Path to file
 * @param {Array} allowedTypes - Array of allowed mime types
 */
const validateFileType = (filePath, allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']) => {
  const ext = path.extname(filePath).toLowerCase();
  const allowedExts = allowedTypes.map(type => `.${type.split('/')[1]}`);
  
  return allowedExts.includes(ext);
};

/**
 * Get file extension
 * @param {string} filename - File name
 */
const getFileExtension = (filename) => {
  return path.extname(filename).toLowerCase();
};

/**
 * Get file name without extension
 * @param {string} filename - File name
 */
const getFileNameWithoutExt = (filename) => {
  return path.basename(filename, path.extname(filename));
};

/**
 * Get relative file path (for database storage)
 * @param {string} absolutePath - Absolute file path
 */
const getRelativePath = (absolutePath) => {
  // Remove 'uploads/' prefix if exists
  return absolutePath.replace(/^uploads\//, '');
};

/**
 * Get absolute file path
 * @param {string} relativePath - Relative file path
 */
const getAbsolutePath = (relativePath) => {
  if (relativePath.startsWith('uploads/')) {
    return relativePath;
  }
  return `uploads/${relativePath}`;
};

/**
 * Check if file exists
 * @param {string} filePath - Path to file
 */
const fileExists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

/**
 * Process uploaded image (compress + thumbnail)
 * @param {string} filePath - Path to uploaded image
 * @param {object} options - Processing options
 */
const processUploadedImage = async (filePath, options = {}) => {
  try {
    // Compress main image
    const compressedPath = await compressImage(filePath, options);
    
    // Create thumbnail (optional)
    let thumbnailPath = null;
    if (options.createThumbnail) {
      thumbnailPath = await createThumbnail(compressedPath);
    }
    
    return {
      originalPath: compressedPath,
      thumbnailPath
    };
  } catch (error) {
    logger.error('Process uploaded image error:', error);
    throw error;
  }
};

module.exports = {
  compressImage,
  createThumbnail,
  deleteFile,
  deleteFiles,
  getFileSize,
  validateFileType,
  getFileExtension,
  getFileNameWithoutExt,
  getRelativePath,
  getAbsolutePath,
  fileExists,
  processUploadedImage
};
