# API Testing Guide

This document provides examples for testing the Parkent Express API endpoints.

## Base URL
```
http://localhost:5000
```

## Testing with curl

### 1. Health Check
```bash
curl http://localhost:5000/health
```

### 2. Register a Customer
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "+998901234567",
    "role": "customer",
    "address": {
      "street": "123 Main St",
      "city": "Parkent",
      "state": "Tashkent",
      "zipCode": "111111"
    }
  }'
```

### 3. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

Save the token from the response for subsequent requests.

### 4. Get Current User
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5. Register a Vendor
First, register a user with vendor role, then create vendor profile:

```bash
# Register vendor user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pizza Palace",
    "email": "vendor@pizzapalace.com",
    "password": "password123",
    "phone": "+998901234567",
    "role": "vendor"
  }'

# Login and get token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "vendor@pizzapalace.com",
    "password": "password123"
  }'

# Create vendor profile
curl -X POST http://localhost:5000/api/vendors \
  -H "Authorization: Bearer VENDOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "restaurantName": "Pizza Palace",
    "description": "Best pizzas in town",
    "cuisine": ["Italian", "Pizza"],
    "address": {
      "street": "456 Food St",
      "city": "Parkent",
      "state": "Tashkent",
      "zipCode": "111111"
    },
    "phone": "+998901234567",
    "email": "vendor@pizzapalace.com",
    "minimumOrder": 50000,
    "deliveryFee": 10000,
    "deliveryTime": "30-45 mins"
  }'
```

### 6. Add Product to Vendor Menu
```bash
curl -X POST http://localhost:5000/api/vendors/VENDOR_ID/products \
  -H "Authorization: Bearer VENDOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Margherita Pizza",
    "description": "Classic pizza with tomato sauce, mozzarella, and basil",
    "price": 85000,
    "category": "Pizza",
    "isVegetarian": true,
    "spiceLevel": "none",
    "preparationTime": 20,
    "ingredients": ["Dough", "Tomato Sauce", "Mozzarella", "Basil"]
  }'
```

### 7. Get All Vendors
```bash
curl http://localhost:5000/api/vendors
```

### 8. Get All Products
```bash
curl http://localhost:5000/api/products
```

### 9. Create an Order
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vendor": "VENDOR_ID",
    "items": [
      {
        "product": "PRODUCT_ID",
        "quantity": 2,
        "specialInstructions": "Extra cheese please"
      }
    ],
    "deliveryAddress": {
      "street": "123 Main St",
      "city": "Parkent",
      "state": "Tashkent",
      "zipCode": "111111"
    },
    "paymentMethod": "cash",
    "specialInstructions": "Call when you arrive"
  }'
```

### 10. Get All Orders
```bash
curl http://localhost:5000/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 11. Update Order Status
```bash
curl -X PATCH http://localhost:5000/api/orders/ORDER_ID/status \
  -H "Authorization: Bearer VENDOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "confirmed"
  }'
```

### 12. Register a Driver
```bash
# Register driver user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mike Driver",
    "email": "mike@driver.com",
    "password": "password123",
    "phone": "+998901234567",
    "role": "driver"
  }'

# Create driver profile
curl -X POST http://localhost:5000/api/drivers \
  -H "Authorization: Bearer DRIVER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleType": "scooter",
    "vehicleNumber": "01A123BC",
    "licenseNumber": "DL123456789"
  }'
```

### 13. Update Driver Status
```bash
curl -X PATCH http://localhost:5000/api/drivers/DRIVER_ID/status \
  -H "Authorization: Bearer DRIVER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "available",
    "currentLocation": {
      "coordinates": {
        "lat": 41.2995,
        "lng": 69.2401
      },
      "address": "Parkent City Center"
    }
  }'
```

### 14. Create a Review
```bash
curl -X POST http://localhost:5000/api/reviews \
  -H "Authorization: Bearer CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "order": "ORDER_ID",
    "foodRating": 5,
    "deliveryRating": 4,
    "comment": "Great food, fast delivery!"
  }'
```

### 15. Get Reviews for a Vendor
```bash
curl http://localhost:5000/api/reviews/vendor/VENDOR_ID
```

## Testing with Postman

1. Import the endpoints into Postman
2. Create an environment with:
   - `base_url`: `http://localhost:5000`
   - `token`: (save after login)
   - `vendor_id`: (save after creating vendor)
   - `product_id`: (save after creating product)
   - `order_id`: (save after creating order)

3. Set Authorization header: `Bearer {{token}}`

## Expected Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": []
}
```

## Status Code Reference

- `200` - OK (GET, PUT, PATCH success)
- `201` - Created (POST success)
- `400` - Bad Request (Validation error)
- `401` - Unauthorized (No token or invalid token)
- `403` - Forbidden (Insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Role Permissions Summary

### Customer
- Can register, login, update profile
- Can view vendors and products
- Can create and view their orders
- Can cancel their orders
- Can create reviews for their orders

### Vendor
- Can register, login, update profile
- Can create and manage their vendor profile
- Can add, update, delete products in their menu
- Can view and update orders for their restaurant
- Can update order status

### Driver
- Can register, login, update profile
- Can create and manage their driver profile
- Can update their status and location
- Can view their assigned orders
- Can update order status (for delivery)

### Admin
- Full access to all endpoints
- Can manage all users, vendors, drivers
- Can view all orders and transactions
- Can approve vendors and drivers
