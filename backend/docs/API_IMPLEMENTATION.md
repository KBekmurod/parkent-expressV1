# API Controllers & Routes - Implementation Summary

This document lists all the API endpoints that have been implemented for Auth, Users, Vendors, and Drivers.

## Authentication Routes (`/api/v1/auth`)

| Method | Endpoint | Description | Access | Validation |
|--------|----------|-------------|--------|------------|
| POST | `/register` | Register new admin | Private (super_admin only) | adminSchemas.register |
| POST | `/login` | Admin login | Public (rate limited) | adminSchemas.login |
| GET | `/me` | Get current admin profile | Private (admin) | - |
| PUT | `/password` | Update admin password | Private (admin) | - |

### Authentication Features:
- ✅ JWT token generation
- ✅ Password hashing and comparison
- ✅ Rate limiting on login (5 requests per 15 minutes)
- ✅ Admin role-based access control
- ✅ Last login tracking

---

## User Routes (`/api/v1/users`)

| Method | Endpoint | Description | Access | Validation |
|--------|----------|-------------|--------|------------|
| POST | `/register` | Register/Get user by Telegram ID | Public (Telegram bot) | userSchemas.register |
| GET | `/telegram/:telegramId` | Get user by Telegram ID | Public (Telegram bot) | - |
| GET | `/` | Get all users (with pagination) | Private/Admin | - |
| GET | `/:id` | Get user by ID | Private/Admin | validateObjectId |
| POST | `/:id/addresses` | Add user address | Public (Telegram bot) | userSchemas.addAddress |
| PUT | `/:id/addresses/:addressIndex` | Update user address | Public (Telegram bot) | userSchemas.addAddress |
| DELETE | `/:id/addresses/:addressIndex` | Delete user address | Public (Telegram bot) | validateObjectId |
| PUT | `/:id/status` | Block/Unblock user | Private/Admin | validateObjectId |

### User Features:
- ✅ User registration with Telegram ID
- ✅ Multiple addresses per user with default flag
- ✅ User search and filtering
- ✅ Pagination support (page, limit)
- ✅ User status management (active/blocked)
- ✅ Address CRUD operations

---

## Vendor Routes (`/api/v1/vendors`)

| Method | Endpoint | Description | Access | Validation |
|--------|----------|-------------|--------|------------|
| GET | `/` | Get all vendors (with pagination) | Public | - |
| GET | `/telegram/:telegramId` | Get vendor by Telegram ID | Public (Telegram bot) | - |
| POST | `/register` | Register vendor | Public (Telegram bot) | vendorSchemas.register |
| GET | `/:id` | Get vendor by ID | Public | validateObjectId |
| PUT | `/:id` | Update vendor | Private (Vendor or Admin) | vendorSchemas.update |
| POST | `/:id/logo` | Upload vendor logo | Private (Vendor or Admin) | uploadSingle |
| PUT | `/:id/toggle` | Toggle vendor open/close | Private (Vendor) | validateObjectId |
| PUT | `/:id/status` | Update vendor status | Private/Admin | validateObjectId |

### Vendor Features:
- ✅ Vendor registration (status: pending)
- ✅ Logo upload with file validation
- ✅ Working hours management
- ✅ Vendor search and filtering by category/status
- ✅ Open/close toggle
- ✅ Status management (pending/active/blocked/closed)
- ✅ Sorting by rating
- ✅ Pagination support

---

## Driver Routes (`/api/v1/drivers`)

| Method | Endpoint | Description | Access | Validation |
|--------|----------|-------------|--------|------------|
| POST | `/register` | Register driver | Public (Telegram bot) | driverSchemas.register |
| GET | `/telegram/:telegramId` | Get driver by Telegram ID | Public (Telegram bot) | - |
| PUT | `/:id/location` | Update driver location | Public (Telegram bot) | driverSchemas.updateLocation |
| PUT | `/:id/toggle-online` | Toggle online/offline | Public (Telegram bot) | validateObjectId |
| POST | `/:id/document` | Upload driver document | Public (Telegram bot) | uploadSingle |
| GET | `/` | Get all drivers | Private/Admin | - |
| GET | `/available` | Get available drivers | Private | - |
| GET | `/:id` | Get driver by ID | Private/Admin | validateObjectId |
| PUT | `/:id/status` | Update driver status | Private/Admin | validateObjectId |

### Driver Features:
- ✅ Driver registration (status: pending)
- ✅ Real-time location tracking
- ✅ Online/offline toggle
- ✅ Document upload
- ✅ Vehicle type support (bicycle/motorcycle/car)
- ✅ Available drivers query (active, online, <3 orders)
- ✅ Status management (pending/active/blocked)
- ✅ Driver search and filtering
- ✅ Current orders population
- ✅ Pagination support

---

## Response Format

All endpoints follow a consistent response format:

### Success Response:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### List Response (with pagination):
```json
{
  "success": true,
  "count": 20,
  "total": 150,
  "pages": 8,
  "currentPage": 1,
  "data": {
    // Array of items
  }
}
```

### Error Response:
```json
{
  "success": false,
  "message": "Error message"
}
```

---

## Middleware Used

- **Error Handling**: `asyncHandler`, `AppError`
- **Authentication**: `protect`, `adminAuth`, `authorize`
- **Validation**: `validate`, `validateObjectId`
- **Rate Limiting**: `authLimiter`, `apiLimiter`
- **File Upload**: `uploadSingle`, `uploadMultiple`

---

## Query Parameters

### Pagination (All list endpoints):
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

### User Filters:
- `status` - Filter by status (active/blocked)
- `search` - Search in firstName, lastName, phone

### Vendor Filters:
- `status` - Filter by status (pending/active/blocked/closed)
- `category` - Filter by category
- `search` - Search in name, description

### Driver Filters:
- `status` - Filter by status (pending/active/blocked)
- `isOnline` - Filter by online status (true/false)
- `search` - Search in firstName, lastName, phone

---

## Security Features

- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ Rate limiting
- ✅ Input validation (Joi schemas)
- ✅ MongoDB sanitization
- ✅ XSS protection
- ✅ Helmet security headers
- ✅ CORS configuration
- ✅ Role-based access control

---

## Files Created

### Controllers:
- `backend/src/controllers/auth.controller.js` - Admin authentication
- `backend/src/controllers/user.controller.js` - Customer operations
- `backend/src/controllers/vendor.controller.js` - Vendor operations
- `backend/src/controllers/driver.controller.js` - Driver operations

### Routes:
- `backend/src/routes/auth.routes.js` - Auth endpoints
- `backend/src/routes/user.routes.js` - User endpoints
- `backend/src/routes/vendor.routes.js` - Vendor endpoints
- `backend/src/routes/driver.routes.js` - Driver endpoints

### Modified:
- `backend/server.js` - Connected all routes

---

## Testing

The server starts successfully without errors. All routes are properly loaded and registered with Express. The API is ready for integration with:
- Telegram bots (Customer, Vendor, Driver)
- Admin panel frontend
- Order management system (to be implemented)
- Product management system (to be implemented)

---

## Next Steps

The following endpoints are ready to be implemented in future steps:
- `/api/v1/orders` - Order management
- `/api/v1/products` - Product/menu management
- `/api/v1/categories` - Category management
- `/api/v1/reviews` - Review system
- `/api/v1/transactions` - Payment tracking
