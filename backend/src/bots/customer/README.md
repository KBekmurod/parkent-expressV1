# Customer Telegram Bot - Parkent Express

## Overview
The Customer Telegram Bot allows users to browse restaurants, place orders, track deliveries, and manage their profiles through Telegram.

## Features

### 1. User Registration
- Automatic registration on first `/start` command
- Phone number collection for order confirmation
- Multilingual support (Uzbek/Russian)

### 2. Restaurant Browsing
- View list of active restaurants
- See restaurant ratings and working hours
- Browse menu by categories
- View product details with photos

### 3. Shopping Cart
- Add products to cart
- View cart contents with pricing
- Clear cart
- Proceed to checkout

### 4. Order Management
- Place orders with delivery address
- Track order status in real-time
- View order history
- See order timeline

### 5. Address Management
- Save multiple delivery addresses
- Set default address
- Add/remove addresses
- Location-based address input

### 6. User Profile
- View profile information
- Manage saved addresses
- See total orders count

## Setup

### Environment Variables
Add the following to your `.env` file:

```bash
CUSTOMER_BOT_TOKEN=your_telegram_bot_token_here
API_URL=http://localhost:5000/api/v1
```

### Getting a Bot Token
1. Open Telegram and search for [@BotFather](https://t.me/BotFather)
2. Send `/newbot` command
3. Follow the instructions to create your bot
4. Copy the token provided by BotFather
5. Add it to your `.env` file as `CUSTOMER_BOT_TOKEN`

### Starting the Bot
The bot automatically starts when the server starts:

```bash
npm start
```

You should see:
```
✅ Customer Bot started
```

## Bot Commands

### `/start`
Registers the user or logs them in if already registered.

## Bot Menu Structure

### Main Menu
- 🍽️ Restoran tanlash (Select Restaurant)
- 📦 Mening buyurtmalarim (My Orders)
- 👤 Profil (Profile)
- ⚙️ Sozlamalar (Settings)

## User Flow

### Placing an Order
1. User sends `/start` to register
2. User shares phone number (first time only)
3. User clicks "🍽️ Restoran tanlash"
4. User selects a restaurant
5. User browses menu and adds items to cart
6. User clicks "🛒 Savat" to view cart
7. User clicks "✅ Buyurtma berish" to checkout
8. User selects or adds delivery address
9. Order is created and confirmed

### Tracking an Order
1. User clicks "📦 Mening buyurtmalarim"
2. User selects an order to track
3. User sees order status and timeline
4. User can refresh to see updates

## Technical Details

### Storage
- **User Cart**: Currently uses in-memory Map (should be replaced with Redis in production)
- **Pending Addresses**: Uses global Map (should be replaced with Redis session storage)

### API Integration
The bot integrates with the following backend API endpoints:
- `POST /api/v1/users/register` - User registration
- `GET /api/v1/users/telegram/:telegramId` - Get user by Telegram ID
- `PUT /api/v1/users/telegram/:telegramId` - Update user info
- `GET /api/v1/vendors` - List restaurants
- `GET /api/v1/products/vendor/:vendorId` - Get restaurant products
- `POST /api/v1/orders` - Create order
- `GET /api/v1/orders/:id` - Get order details

### Message Types Handled
- Text messages (menu navigation)
- Contact messages (phone number)
- Location messages (delivery address)
- Callback queries (inline keyboard interactions)

## Production Recommendations

### 1. Replace In-Memory Storage
Currently, the bot uses in-memory Maps for:
- Shopping carts (`userCarts`)
- Pending addresses (`global.pendingAddresses`)

**Replace with Redis:**
```javascript
const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);

// Store cart
await redis.setex(`cart:${chatId}`, 3600, JSON.stringify(cart));

// Get cart
const cartData = await redis.get(`cart:${chatId}`);
const cart = cartData ? JSON.parse(cartData) : [];
```

### 2. Add Session Management
Implement proper session management for multi-step operations (like adding addresses).

### 3. Add Rate Limiting
Prevent abuse by implementing rate limiting:
```javascript
const rateLimiter = new Map();

function checkRateLimit(userId) {
  const now = Date.now();
  const userLimit = rateLimiter.get(userId) || { count: 0, resetTime: now + 60000 };
  
  if (now > userLimit.resetTime) {
    userLimit.count = 0;
    userLimit.resetTime = now + 60000;
  }
  
  if (userLimit.count >= 30) {
    return false;
  }
  
  userLimit.count++;
  rateLimiter.set(userId, userLimit);
  return true;
}
```

### 4. Add Error Handling
- Implement retry logic for API calls
- Add circuit breaker for failing services
- Log all errors to monitoring service

### 5. Add Analytics
Track user interactions:
- Order conversion rate
- Popular restaurants
- Average cart value
- User retention

## Troubleshooting

### Bot Not Starting
1. Check if `CUSTOMER_BOT_TOKEN` is set in `.env`
2. Verify token is valid with BotFather
3. Check server logs for errors

### Bot Not Responding
1. Check if polling is working (no errors in logs)
2. Verify network connectivity
3. Check if bot is not stopped by Telegram (too many errors)

### Orders Not Creating
1. Verify API endpoints are accessible
2. Check if user has items in cart
3. Ensure delivery address is provided
4. Check MongoDB connection

## Files Structure

```
backend/src/bots/customer/
├── index.js                          # Bot initialization and routing
├── handlers/
│   ├── start.handler.js              # Registration and welcome
│   ├── menu.handler.js               # Menu navigation
│   ├── vendor.handler.js             # Restaurant and product browsing
│   ├── cart.handler.js               # Shopping cart management
│   ├── order.handler.js              # Order creation and tracking
│   ├── address.handler.js            # Address management
│   └── profile.handler.js            # User profile
├── keyboards/
│   └── mainMenu.js                   # Main menu keyboard
└── utils/
    ├── messages.js                   # Bot messages (uz/ru)
    └── helpers.js                    # Helper functions
```

## Support

For issues or questions:
1. Check the logs in `logs/` directory
2. Review error messages in console
3. Open an issue on GitHub

## License
MIT
