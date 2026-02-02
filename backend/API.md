# Backend API Reference

Complete API endpoint documentation.

## Base URL

```
http://localhost:5000/api/v1
```

## Authentication

### Register
```http
POST /auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+998901234567",
  "role": "customer"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "customer"
    }
  }
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

### Update Profile
```http
PUT /auth/update
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+998901234567"
}
```

### Change Password
```http
PUT /auth/password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldpass123",
  "newPassword": "newpass123"
}
```

## Users (Admin Only)

### List Users
```http
GET /users?page=1&limit=10&role=customer&search=john
Authorization: Bearer <admin_token>
```

Query Parameters:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `role` (string): Filter by role
- `search` (string): Search by name or email

### Get User
```http
GET /users/:id
Authorization: Bearer <admin_token>
```

### Update User
```http
PUT /users/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "firstName": "Updated",
  "isActive": true
}
```

### Delete User
```http
DELETE /users/:id
Authorization: Bearer <admin_token>
```

## Vendors

### List Vendors
```http
GET /vendors?page=1&category=restaurant&status=active
```

Query Parameters:
- `page`, `limit`: Pagination
- `category`: Filter by category
- `status`: active | pending | rejected
- `search`: Search by name

### Get Vendor
```http
GET /vendors/:id
```

### Create Vendor (Admin)
```http
POST /vendors
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Pizza House",
  "category": "restaurant",
  "phone": "+998901234567",
  "email": "pizza@example.com",
  "address": {
    "street": "Main Street 123",
    "city": "Parkent",
    "coordinates": [69.6843, 41.2995]
  }
}
```

### Update Vendor
```http
PUT /vendors/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "phone": "+998901234567"
}
```

### Approve Vendor (Admin)
```http
PUT /vendors/:id/approve
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "active"
}
```

### Delete Vendor (Admin)
```http
DELETE /vendors/:id
Authorization: Bearer <admin_token>
```

## Products

### List Products
```http
GET /products?vendor=507f1f77bcf86cd799439011&category=pizza
```

### Get Product
```http
GET /products/:id
```

### Create Product (Vendor)
```http
POST /products
Authorization: Bearer <vendor_token>
Content-Type: application/json

{
  "name": {
    "uz": "Pepperoni Pizza",
    "ru": "Пицца Пепперони"
  },
  "description": {
    "uz": "Pizza tavsifi",
    "ru": "Описание пиццы"
  },
  "price": 45000,
  "category": "pizza",
  "vendor": "507f1f77bcf86cd799439011",
  "isAvailable": true
}
```

### Update Product (Vendor)
```http
PUT /products/:id
Authorization: Bearer <vendor_token>
Content-Type: application/json

{
  "price": 50000,
  "isAvailable": false
}
```

### Upload Product Image
```http
POST /products/:id/image
Authorization: Bearer <vendor_token>
Content-Type: multipart/form-data

FormData: { image: <file> }
```

### Delete Product (Vendor)
```http
DELETE /products/:id
Authorization: Bearer <vendor_token>
```

## Orders

### List Orders
```http
GET /orders?status=pending&page=1
Authorization: Bearer <token>
```

### Get Order
```http
GET /orders/:id
Authorization: Bearer <token>
```

### Create Order (Customer)
```http
POST /orders
Authorization: Bearer <customer_token>
Content-Type: application/json

{
  "vendor": "507f1f77bcf86cd799439011",
  "items": [
    {
      "product": "507f191e810c19729de860ea",
      "quantity": 2
    }
  ],
  "deliveryAddress": {
    "street": "Main Street 456",
    "city": "Parkent",
    "coordinates": [69.6843, 41.2995]
  },
  "paymentMethod": "cash"
}
```

### Update Order Status
```http
PUT /orders/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "preparing"
}
```

Status flow:
- `pending` → `accepted` → `preparing` → `ready` → `on_the_way` → `delivered`
- Can be `rejected` or `cancelled`

### Track Order
```http
GET /orders/:id/track
Authorization: Bearer <customer_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "order": {
      "_id": "...",
      "orderNumber": "ORD-20240201-001",
      "status": "on_the_way",
      "driver": {
        "firstName": "Driver",
        "phone": "+998901234567",
        "location": {
          "type": "Point",
          "coordinates": [69.68, 41.29]
        }
      },
      "estimatedTime": "15 minutes"
    }
  }
}
```

### Assign Driver (Admin)
```http
PUT /orders/:id/assign
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "driverId": "507f1f77bcf86cd799439011"
}
```

## Categories

### List Categories
```http
GET /categories
```

### Get Category
```http
GET /categories/:id
```

### Create Category (Admin)
```http
POST /categories
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": {
    "uz": "Pizza",
    "ru": "Пицца"
  },
  "icon": "🍕"
}
```

### Update Category (Admin)
```http
PUT /categories/:id
Authorization: Bearer <admin_token>
```

### Delete Category (Admin)
```http
DELETE /categories/:id
Authorization: Bearer <admin_token>
```

## Reviews

### List Reviews
```http
GET /reviews?vendor=507f1f77bcf86cd799439011
```

### Create Review (Customer)
```http
POST /reviews
Authorization: Bearer <customer_token>
Content-Type: application/json

{
  "vendor": "507f1f77bcf86cd799439011",
  "order": "507f191e810c19729de860ea",
  "rating": 5,
  "comment": "Great service!"
}
```

### Update Review
```http
PUT /reviews/:id
Authorization: Bearer <customer_token>
Content-Type: application/json

{
  "rating": 4,
  "comment": "Updated review"
}
```

### Delete Review
```http
DELETE /reviews/:id
Authorization: Bearer <customer_token>
```

## Drivers

### List Drivers
```http
GET /drivers?status=approved&isOnline=true
Authorization: Bearer <token>
```

### Get Driver
```http
GET /drivers/:id
Authorization: Bearer <token>
```

### Update Driver Location
```http
PUT /drivers/:id/location
Authorization: Bearer <driver_token>
Content-Type: application/json

{
  "coordinates": [69.6843, 41.2995]
}
```

### Approve Driver (Admin)
```http
PUT /drivers/:id/approve
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "approved"
}
```

### Get Driver Earnings
```http
GET /drivers/:id/earnings?from=2024-01-01&to=2024-12-31
Authorization: Bearer <driver_token>
```

## Transactions

### List Transactions
```http
GET /transactions?page=1&type=payout
Authorization: Bearer <token>
```

### Get Transaction
```http
GET /transactions/:id
Authorization: Bearer <token>
```

### Request Payout (Driver)
```http
POST /transactions/payout
Authorization: Bearer <driver_token>
Content-Type: application/json

{
  "amount": 500000,
  "method": "bank_transfer"
}
```

## Statistics (Admin Only)

### Dashboard Stats
```http
GET /stats/dashboard
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 1250,
    "totalOrders": 3421,
    "totalRevenue": 125000000,
    "activeDrivers": 45,
    "todayOrders": 123,
    "todayRevenue": 5400000
  }
}
```

### Revenue Analytics
```http
GET /stats/revenue?from=2024-01-01&to=2024-12-31
Authorization: Bearer <admin_token>
```

### Order Analytics
```http
GET /stats/orders?period=month
Authorization: Bearer <admin_token>
```

### Vendor Performance
```http
GET /stats/vendors?limit=10&sort=-revenue
Authorization: Bearer <admin_token>
```

### Driver Performance
```http
GET /stats/drivers?limit=10&sort=-deliveries
Authorization: Bearer <admin_token>
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Not authorized to access this route"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "User role is not authorized to access this route"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

### 500 Server Error
```json
{
  "success": false,
  "error": "Server error"
}
```

## Rate Limiting

- **Limit:** 100 requests per 15 minutes per IP
- **Headers:**
  - `X-RateLimit-Limit`: Maximum requests
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset timestamp

## Pagination

Default pagination for list endpoints:
```
?page=1&limit=10&sort=-createdAt
```

**Response includes:**
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalPages": 5,
      "totalItems": 50,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

## File Upload

**Endpoint:** `POST /upload`
**Content-Type:** `multipart/form-data`
**Max Size:** 5MB
**Allowed Types:** image/jpeg, image/png, image/jpg, application/pdf

## Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-02-01T12:00:00.000Z",
  "uptime": 123456,
  "database": "connected"
}
```
