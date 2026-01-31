# Middleware Documentation

This directory contains all security and utility middleware for the Parkent Express backend.

## Files

### 1. `auth.middleware.js`
JWT authentication and authorization middleware.

**Exports:**
- `protect` - Verify JWT token and attach user to request
- `adminAuth` - Check if user is an active admin
- `authorize(...roles)` - Role-based access control
- `telegramAuth(userType)` - Telegram user authentication

**Usage:**
```javascript
const { protect, adminAuth, authorize } = require('./middleware/auth.middleware');

// Protected route
router.get('/profile', protect, getProfile);

// Admin only
router.get('/admin/stats', protect, adminAuth, getStats);

// Role-based
router.post('/users', protect, adminAuth, authorize('super_admin'), createUser);
```

### 2. `validation.middleware.js`
Request validation using Joi schemas.

**Exports:**
- `validate(schema)` - Validate request body
- `validateQuery(schema)` - Validate query parameters
- `validateObjectId(paramName)` - Validate MongoDB ObjectId

**Usage:**
```javascript
const { validate } = require('./middleware/validation.middleware');
const { userSchemas } = require('../utils/validators');

router.post('/register', validate(userSchemas.register), registerUser);
```

### 3. `error.middleware.js`
Global error handling and custom error classes.

**Exports:**
- `AppError` - Custom error class
- `errorHandler` - Global error handler
- `notFound` - 404 handler
- `asyncHandler(fn)` - Async error wrapper

**Usage:**
```javascript
const { asyncHandler, AppError } = require('./middleware/error.middleware');

router.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found', 404);
  res.json({ success: true, data: user });
}));
```

### 4. `rateLimit.middleware.js`
Rate limiting configuration for different endpoints.

**Exports:**
- `apiLimiter` - General API (100 req/15min)
- `authLimiter` - Auth endpoints (5 req/15min)
- `orderLimiter` - Order creation (10 req/hour)
- `uploadLimiter` - File uploads (20 req/hour)

**Usage:**
```javascript
const { authLimiter, orderLimiter } = require('./middleware/rateLimit.middleware');

router.post('/login', authLimiter, login);
router.post('/orders', orderLimiter, createOrder);
```

## Security Features

1. **JWT Authentication**
   - Bearer token validation
   - Automatic token verification
   - User/Admin lookup and validation

2. **Request Validation**
   - Joi schema validation
   - Field-level error messages
   - Unknown field stripping

3. **Error Handling**
   - Custom error classes
   - Development vs Production modes
   - MongoDB error transformation
   - JWT error handling

4. **Rate Limiting**
   - IP-based rate limiting
   - Configurable windows and limits
   - Custom error messages

## Environment Variables

Required in `.env`:
```
JWT_SECRET=your-secret-key
NODE_ENV=development|production
```

## Testing

All middleware has been tested and verified:
- ✅ Module imports successful
- ✅ JWT signing and verification
- ✅ Validation schemas working
- ✅ Error handling functional
- ✅ Rate limiters configured
