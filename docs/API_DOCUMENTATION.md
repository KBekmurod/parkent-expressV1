# API Documentation

Base URL: `http://localhost:5000/api/v1`

## Authentication

All protected endpoints require JWT token in header:
```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### Register User
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

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "_id": "...",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "customer"
    }
  }
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Vendors

#### List Vendors
```http
GET /vendors?page=1&limit=10&category=restaurant&status=active
```

#### Get Vendor
```http
GET /vendors/:id
```

#### Create Vendor (Admin only)
```http
POST /vendors
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Pizza House",
  "category": "restaurant",
  "phone": "+998901234567",
  "address": {
    "street": "Main St",
    "city": "Parkent",
    "coordinates": [69.6843, 41.2995]
  }
}
```

### Products

#### List Products
```http
GET /products?vendor=:vendorId&category=pizza
```

#### Create Product
```http
POST /products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": {
    "uz": "Pepperoni Pizza",
    "ru": "Пицца Пепперони"
  },
  "description": {
    "uz": "...",
    "ru": "..."
  },
  "price": 45000,
  "category": "pizza",
  "vendor": "vendorId"
}
```

### Orders

#### Create Order
```http
POST /orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "vendor": "vendorId",
  "items": [
    {
      "product": "productId",
      "quantity": 2
    }
  ],
  "deliveryAddress": {
    "street": "Main St",
    "city": "Parkent",
    "coordinates": [69.6843, 41.2995]
  }
}
```

#### Track Order
```http
GET /orders/:id/track
Authorization: Bearer <token>
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
        "phone": "+998...",
        "location": {
          "coordinates": [69.68, 41.29]
        }
      }
    }
  }
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

## Error Response

```json
{
  "success": false,
  "error": "Error message here"
}
```

## Rate Limiting

- 100 requests per 15 minutes per IP
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`

## Pagination

```
?page=1&limit=10&sort=-createdAt
```

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalPages": 5,
      "totalItems": 50
    }
  }
}
```
