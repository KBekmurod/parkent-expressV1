# File Upload Usage Guide

## Upload Single File

```javascript
const { uploadSingle } = require('../middleware/upload.middleware');
const { processUploadedImage } = require('../utils/fileUpload');

// In route
router.post('/products', 
  uploadSingle('photo'),
  async (req, res) => {
    if (req.file) {
      // Process image
      const { originalPath } = await processUploadedImage(req.file.path, {
        width: 1200,
        quality: 80
      });
      
      // Save to database
      product.photo = originalPath;
    }
  }
);
```

## Upload Multiple Files

```javascript
const { uploadMultiple } = require('../middleware/upload.middleware');

router.post('/products/gallery',
  uploadMultiple('photos', 5), // Max 5 files
  async (req, res) => {
    if (req.files && req.files.length > 0) {
      const filePaths = req.files.map(file => file.path);
      // Process files...
    }
  }
);
```

## Upload Multiple Fields

```javascript
const { uploadFields } = require('../middleware/upload.middleware');

router.post('/vendor/register',
  uploadFields([
    { name: 'logo', maxCount: 1 },
    { name: 'photos', maxCount: 5 }
  ]),
  async (req, res) => {
    if (req.files.logo) {
      // Logo file
    }
    if (req.files.photos) {
      // Gallery photos
    }
  }
);
```

## Delete File

```javascript
const { deleteFile } = require('../utils/fileUpload');

// Delete old logo when updating
if (oldLogoPath) {
  await deleteFile(oldLogoPath);
}
```

## Supported File Types

- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)

## Size Limits

- Maximum file size: 5MB per file
- Recommended dimensions: 1200px width (auto height)

## Storage Structure

```
uploads/
├── menus/          # Product photos
├── logos/          # Vendor logos
└── documents/      # Driver ID photos
```
