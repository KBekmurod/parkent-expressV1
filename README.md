# Parkent Express - Food Delivery Backend API

A comprehensive backend system for the Parkent Express food delivery platform built with Node.js, Express, and MongoDB.

## Features

- **JWT-based Authentication** - Secure user authentication and authorization
- **Role-based Access Control** - Customer, Vendor, Driver, and Admin roles
- **RESTful API** - Complete CRUD operations for all entities
- **Request Validation** - Input validation using Joi
- **Error Handling** - Consistent error responses across the API
- **Database Models** - Well-structured MongoDB schemas with Mongoose

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **Joi** - Request validation
- **Dotenv** - Environment configuration

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/KBekmurod/parkent-expressV1.git
cd parkent-expressV1
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/parkent-express
JWT_SECRET=your-secret-key-here-change-in-production
JWT_EXPIRE=7d
```

5. Start the server:
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## API Documentation

### Authentication Endpoints

#### Register User
- **POST** `/api/auth/register`
- **Body**: `{ name, email, password, phone, role, address }`
- **Response**: User object with JWT token

#### Login User
- **POST** `/api/auth/login`
- **Body**: `{ email, password }`
- **Response**: User object with JWT token

#### Get Current User
- **GET** `/api/auth/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Current user details

### User Management

#### Get User Profile
- **GET** `/api/users/profile`
- **Headers**: `Authorization: Bearer <token>`

#### Update User Profile
- **PUT** `/api/users/profile`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ name, phone, address }`

#### Delete User Account
- **DELETE** `/api/users/profile`
- **Headers**: `Authorization: Bearer <token>`

### Vendor Management

#### Create Vendor
- **POST** `/api/vendors`
- **Headers**: `Authorization: Bearer <token>`
- **Role**: Vendor or Admin
- **Body**: Vendor details (restaurantName, description, cuisine, address, etc.)

#### Get All Vendors
- **GET** `/api/vendors`

#### Get Vendor by ID
- **GET** `/api/vendors/:id`

#### Update Vendor
- **PUT** `/api/vendors/:id`
- **Headers**: `Authorization: Bearer <token>`
- **Role**: Vendor owner or Admin

#### Delete Vendor
- **DELETE** `/api/vendors/:id`
- **Headers**: `Authorization: Bearer <token>`
- **Role**: Vendor owner or Admin

#### Add Product to Vendor
- **POST** `/api/vendors/:id/products`
- **Headers**: `Authorization: Bearer <token>`
- **Role**: Vendor owner or Admin
- **Body**: Product details (name, description, price, category, etc.)

#### Update Product
- **PUT** `/api/vendors/:vendorId/products/:productId`
- **Headers**: `Authorization: Bearer <token>`
- **Role**: Vendor owner or Admin

#### Delete Product
- **DELETE** `/api/vendors/:vendorId/products/:productId`
- **Headers**: `Authorization: Bearer <token>`
- **Role**: Vendor owner or Admin

### Driver Management

#### Register Driver
- **POST** `/api/drivers`
- **Headers**: `Authorization: Bearer <token>`
- **Role**: Driver or Admin
- **Body**: Driver details (vehicleType, vehicleNumber, licenseNumber, etc.)

#### Get All Drivers
- **GET** `/api/drivers`
- **Headers**: `Authorization: Bearer <token>`
- **Role**: Admin

#### Get Driver by ID
- **GET** `/api/drivers/:id`
- **Headers**: `Authorization: Bearer <token>`

#### Update Driver
- **PUT** `/api/drivers/:id`
- **Headers**: `Authorization: Bearer <token>`
- **Role**: Driver owner or Admin

#### Update Driver Status
- **PATCH** `/api/drivers/:id/status`
- **Headers**: `Authorization: Bearer <token>`
- **Role**: Driver owner or Admin
- **Body**: `{ status, currentLocation }`

#### Get Driver Orders
- **GET** `/api/drivers/:id/orders`
- **Headers**: `Authorization: Bearer <token>`
- **Role**: Driver owner or Admin

### Product Management

#### Get All Products
- **GET** `/api/products`

#### Get Product by ID
- **GET** `/api/products/:id`

### Order Management

#### Create Order
- **POST** `/api/orders`
- **Headers**: `Authorization: Bearer <token>`
- **Role**: Customer
- **Body**: Order details (vendor, items, deliveryAddress, paymentMethod, etc.)

#### Get All Orders
- **GET** `/api/orders`
- **Headers**: `Authorization: Bearer <token>`
- **Note**: Returns orders based on user role

#### Get Order by ID
- **GET** `/api/orders/:id`
- **Headers**: `Authorization: Bearer <token>`

#### Update Order
- **PUT** `/api/orders/:id`
- **Headers**: `Authorization: Bearer <token>`
- **Role**: Vendor or Admin

#### Update Order Status
- **PATCH** `/api/orders/:id/status`
- **Headers**: `Authorization: Bearer <token>`
- **Role**: Vendor, Driver, or Admin
- **Body**: `{ status }`

#### Cancel Order
- **DELETE** `/api/orders/:id`
- **Headers**: `Authorization: Bearer <token>`
- **Role**: Customer or Admin
- **Body**: `{ reason }` (optional)

### Review System

#### Create Review
- **POST** `/api/reviews`
- **Headers**: `Authorization: Bearer <token>`
- **Role**: Customer
- **Body**: Review details (order, foodRating, deliveryRating, comment, etc.)

#### Get Reviews by Order
- **GET** `/api/reviews/order/:orderId`
- **Headers**: `Authorization: Bearer <token>`

#### Get Reviews by Vendor
- **GET** `/api/reviews/vendor/:vendorId`

#### Update Review
- **PUT** `/api/reviews/:id`
- **Headers**: `Authorization: Bearer <token>`
- **Role**: Review author

#### Delete Review
- **DELETE** `/api/reviews/:id`
- **Headers**: `Authorization: Bearer <token>`
- **Role**: Review author or Admin

### Transaction Management

#### Create Transaction
- **POST** `/api/transactions`
- **Headers**: `Authorization: Bearer <token>`
- **Role**: Admin
- **Body**: Transaction details

#### Get All Transactions
- **GET** `/api/transactions`
- **Headers**: `Authorization: Bearer <token>`
- **Note**: Returns transactions based on user role

#### Get Transaction by ID
- **GET** `/api/transactions/:id`
- **Headers**: `Authorization: Bearer <token>`

#### Get Transactions by Order
- **GET** `/api/transactions/order/:orderId`
- **Headers**: `Authorization: Bearer <token>`

## Project Structure

```
parkent-expressV1/
├── config/
│   └── db.js                 # Database configuration
├── controllers/
│   ├── authController.js     # Authentication logic
│   ├── userController.js     # User management logic
│   ├── vendorController.js   # Vendor management logic
│   ├── driverController.js   # Driver management logic
│   ├── productController.js  # Product management logic
│   ├── orderController.js    # Order management logic
│   ├── reviewController.js   # Review system logic
│   └── transactionController.js # Transaction logic
├── middlewares/
│   ├── auth.js              # Authentication & authorization
│   ├── validator.js         # Request validation schemas
│   └── error.js             # Error handling
├── models/
│   ├── User.js              # User/Customer model
│   ├── Vendor.js            # Vendor/Restaurant model
│   ├── Driver.js            # Driver model
│   ├── Product.js           # Product/Menu item model
│   ├── Order.js             # Order model
│   ├── Review.js            # Review model
│   └── Transaction.js       # Transaction model
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── users.js             # User routes
│   ├── vendors.js           # Vendor routes
│   ├── drivers.js           # Driver routes
│   ├── products.js          # Product routes
│   ├── orders.js            # Order routes
│   ├── reviews.js           # Review routes
│   └── transactions.js      # Transaction routes
├── utils/
│   └── jwt.js               # JWT utilities
├── .env.example             # Example environment variables
├── .gitignore               # Git ignore file
├── package.json             # Project dependencies
├── server.js                # Main application file
└── README.md                # Project documentation
```

## Database Models

### User Model
- name, email, password, phone, role, address, isActive
- Roles: customer, vendor, driver, admin
- Password hashing with bcrypt

### Vendor Model
- user, restaurantName, description, cuisine, address, openingHours
- rating, totalReviews, isActive, isApproved
- logo, banner, minimumOrder, deliveryFee, deliveryTime

### Driver Model
- user, vehicleType, vehicleNumber, licenseNumber, status
- currentLocation, rating, totalDeliveries, totalReviews
- isApproved, isActive, documents

### Product Model
- vendor, name, description, price, category, image
- isAvailable, isVegetarian, isVegan, spiceLevel
- preparationTime, ingredients, allergens, nutritionInfo
- rating, totalReviews

### Order Model
- customer, vendor, driver, items, deliveryAddress, status
- subtotal, deliveryFee, tax, total
- paymentMethod, paymentStatus, specialInstructions
- estimatedDeliveryTime, actualDeliveryTime

### Review Model
- order, customer, vendor, driver
- foodRating, deliveryRating, overallRating, comment
- images, response

### Transaction Model
- order, customer, vendor, driver, amount, type
- paymentMethod, status, transactionId
- paymentGateway, gatewayTransactionId, description

## Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "message": "Error message",
  "errors": [] // Optional validation errors
}
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Contact

For any questions or support, please contact the development team.