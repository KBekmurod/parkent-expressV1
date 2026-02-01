# Vendor Telegram Bot

Comprehensive Telegram bot for vendors/restaurants to manage their orders, menu, and statistics on Parkent Express platform.

## Features

### 1. Multi-step Registration Flow
- Phone number collection via contact button
- Location collection for restaurant address
- Business details (name, category, description)
- Working hours configuration
- Automatic submission for admin approval

### 2. Order Management
- View active orders (pending, accepted, preparing)
- View order history (ready, delivered, cancelled, rejected)
- Accept orders with one click
- Reject orders with predefined or custom reasons
- Update order status (preparing → ready)
- Real-time order notifications

### 3. Menu/Product Management
- View all products with availability status
- Add new products with multi-step flow:
  - Product name (Uzbek & Russian)
  - Price and category
  - Preparation time
  - Description (optional, bilingual)
  - Photo upload (optional)
- Toggle product availability
- Product details view

### 4. Profile Management
- View complete vendor profile
- Toggle restaurant open/closed status
- View rating and total orders
- Check current balance

### 5. Statistics Dashboard
- Daily statistics (orders count, earnings)
- Weekly statistics
- Monthly statistics
- Overall performance metrics

## Structure

```
vendor/
├── index.js                    # Bot initialization and routing
├── handlers/
│   ├── start.handler.js        # Registration flow
│   ├── orders.handler.js       # Order management
│   ├── menu.handler.js         # Product management
│   ├── profile.handler.js      # Profile view and settings
│   └── stats.handler.js        # Statistics dashboard
├── keyboards/
│   ├── mainMenu.js             # Main menu keyboard
│   ├── orderMenu.js            # Order action keyboards
│   └── productMenu.js          # Product management keyboards
└── utils/
    ├── messages.js             # Bilingual messages (uz/ru)
    └── helpers.js              # Helper functions
```

## Message Flow

### Registration
1. /start → Welcome & phone request
2. Contact shared → Phone saved, location request
3. Location shared → Business name request
4. Name entered → Category selection
5. Category selected → Description request (optional)
6. Description entered → Working hours request
7. Hours entered → Registration complete, pending approval

### Order Management
1. New order arrives → Vendor receives notification
2. Vendor can: Accept, Reject (with reason), or View details
3. Accepted order → Can mark as "Preparing"
4. Preparing → Can mark as "Ready"
5. Ready → Driver can pick up

### Product Creation
1. Click "Add Product" → Name request (Uzbek)
2. Name entered → Name request (Russian, optional)
3. Russian name → Price request
4. Price entered → Category request
5. Category entered → Preparation time request
6. Time entered → Description request (Uzbek, optional)
7. Description → Description request (Russian, optional)
8. Description → Photo request (optional)
9. Photo/Skip → Product created

## API Integration

The bot integrates with the following backend endpoints:

- `POST /api/v1/vendors/register` - Vendor registration
- `GET /api/v1/vendors/telegram/:telegramId` - Get vendor by Telegram ID
- `PUT /api/v1/vendors/:id/toggle` - Toggle open/close status
- `GET /api/v1/orders/vendor/:vendorId` - Get vendor orders
- `PUT /api/v1/orders/:id/status` - Update order status
- `GET /api/v1/products/vendor/:vendorId` - Get vendor products
- `POST /api/v1/products` - Create product
- `PUT /api/v1/products/:id/toggle` - Toggle product availability

## State Management

Uses global Maps for state management:
- `global.vendorRegistrations` - Registration flow state
- `global.productCreationStates` - Product creation flow state
- `global.productEditStates` - Product edit flow state
- `global.orderRejectionInputs` - Custom rejection reason input

## Language Support

Full bilingual support (Uzbek & Russian):
- All messages translated
- Keyboards adapted per language
- Product data stored in both languages

## Configuration

Required environment variables:
```env
VENDOR_BOT_TOKEN=your-vendor-bot-token
API_URL=http://localhost:5000/api/v1
```

## Usage

The bot is automatically initialized in `server.js`:

```javascript
const { initVendorBot } = require('./src/bots/vendor');
const vendorBot = initVendorBot();
```

## Future Enhancements

- Profile editing functionality
- Advanced analytics with charts
- Bulk product operations
- Promotional campaigns management
- Customer reviews management
