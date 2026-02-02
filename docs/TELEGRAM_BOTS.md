# Telegram Bots Documentation

This project includes 3 Telegram bots for different user types.

## 🤖 Bot Overview

### 1. Customer Bot
**Purpose:** Customers can browse vendors, order food, and track deliveries.

**Features:**
- 🏪 Browse vendors by category
- 🔍 Search products
- 🛒 Shopping cart management
- 📦 Place orders
- 📍 Real-time GPS tracking
- 💳 Payment integration
- 📜 Order history
- ⭐ Leave reviews

### 2. Vendor Bot
**Purpose:** Restaurant owners can manage their menu and orders.

**Features:**
- 🍽️ Menu management (add/edit/delete products)
- 📋 Receive order notifications
- ✅ Accept/reject orders
- 🔄 Update order status
- 📊 View sales statistics
- 💰 Track revenue
- ⭐ Manage reviews
- 📈 Performance analytics

### 3. Driver Bot
**Purpose:** Delivery drivers can accept orders and track earnings.

**Features:**
- 🚗 Register with vehicle information
- 📄 Upload driver documents
- 🟢 Online/offline status toggle
- 📦 View available deliveries
- ✅ Accept delivery assignments
- 📍 GPS location tracking
- ✔️ Confirm delivery completion
- 💵 View earnings
- 💳 Request payouts

## 🛠️ Setup Instructions

### 1. Create Bots with BotFather

Open Telegram and find **@BotFather**, then create 3 bots:

**Customer Bot:**
```
/newbot
Bot name: Parkent Customer Bot
Username: parkent_customer_bot
```

**Vendor Bot:**
```
/newbot
Bot name: Parkent Vendor Bot
Username: parkent_vendor_bot
```

**Driver Bot:**
```
/newbot
Bot name: Parkent Driver Bot
Username: parkent_driver_bot
```

### 2. Get Bot Tokens

BotFather will provide tokens like:
```
1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
```

### 3. Configure Environment

Add tokens to `backend/.env`:
```env
CUSTOMER_BOT_TOKEN=your_customer_bot_token
VENDOR_BOT_TOKEN=your_vendor_bot_token
DRIVER_BOT_TOKEN=your_driver_bot_token
```

### 4. Start Bots

Bots start automatically when you run the backend:
```bash
cd backend
npm run dev
```

## 📱 Bot Commands

### Customer Bot Commands

```
/start - Start the bot and register
/menu - Browse vendors
/cart - View shopping cart
/orders - View order history
/track - Track current order
/profile - View profile
/help - Get help
```

### Vendor Bot Commands

```
/start - Register as vendor
/menu - Manage menu
/orders - View orders
/stats - View statistics
/profile - Manage profile
/settings - Bot settings
/help - Get help
```

### Driver Bot Commands

```
/start - Register as driver
/online - Go online
/offline - Go offline
/deliveries - View available deliveries
/earnings - View earnings
/profile - Manage profile
/help - Get help
```

## 🔄 Bot Workflows

### Customer Order Flow

1. Customer opens bot → `/start`
2. Bot displays vendor categories
3. Customer selects category → sees vendors
4. Customer selects vendor → sees menu
5. Customer adds items to cart
6. Customer proceeds to checkout
7. Customer confirms order and location
8. Bot confirms order and provides tracking
9. Customer receives real-time updates
10. Customer can track driver location
11. Order delivered → Customer can leave review

### Vendor Order Management Flow

1. Vendor receives order notification
2. Vendor reviews order details
3. Vendor accepts or rejects order
4. If accepted, vendor updates order status:
   - Preparing
   - Ready for pickup
5. Driver picks up order
6. Order completed → Vendor sees statistics

### Driver Delivery Flow

1. Driver goes online → `/online`
2. Bot shows available deliveries
3. Driver accepts delivery
4. Bot provides pickup location
5. Driver picks up order → updates status
6. Bot provides delivery location
7. Driver navigates to customer
8. Driver confirms delivery
9. Earnings updated automatically
10. Driver can request payout

## 🗂️ Bot Structure

```
backend/src/bots/
├── customer/
│   ├── index.js                 # Main bot file
│   ├── handlers/
│   │   ├── start.handler.js
│   │   ├── menu.handler.js
│   │   ├── cart.handler.js
│   │   ├── order.handler.js
│   │   ├── tracking.handler.js
│   │   ├── profile.handler.js
│   │   └── review.handler.js
│   ├── keyboards/
│   │   ├── main.keyboard.js
│   │   ├── categories.keyboard.js
│   │   ├── vendors.keyboard.js
│   │   ├── products.keyboard.js
│   │   ├── cart.keyboard.js
│   │   └── orders.keyboard.js
│   └── utils/
│       ├── messages.js
│       └── helpers.js
│
├── vendor/
│   ├── index.js
│   ├── handlers/
│   │   ├── start.handler.js
│   │   ├── menu.handler.js
│   │   ├── orders.handler.js
│   │   ├── stats.handler.js
│   │   └── profile.handler.js
│   ├── keyboards/
│   │   ├── main.keyboard.js
│   │   ├── menu.keyboard.js
│   │   ├── orders.keyboard.js
│   │   ├── stats.keyboard.js
│   │   └── profile.keyboard.js
│   └── utils/
│       ├── messages.js
│       └── helpers.js
│
└── driver/
    ├── index.js
    ├── handlers/
    │   ├── start.handler.js
    │   ├── deliveries.handler.js
    │   ├── earnings.handler.js
    │   ├── status.handler.js
    │   └── profile.handler.js
    ├── keyboards/
    │   ├── main.keyboard.js
    │   ├── deliveries.keyboard.js
    │   └── status.keyboard.js
    └── utils/
        ├── messages.js
        └── helpers.js
```

## 🌐 Localization

All bots support multiple languages:
- 🇺🇿 Uzbek (uz)
- 🇷🇺 Russian (ru)

Users can change language in bot settings.

## 🔐 Security

- User authentication via Telegram ID
- Role-based access control
- Data encryption
- Secure token storage
- Rate limiting for bot commands

## 📊 Bot Statistics

Bot usage statistics available in Admin Panel:
- Active users per bot
- Commands usage frequency
- Order conversion rates
- Average response time
- User retention metrics

## 🐛 Troubleshooting

### Bot Not Responding
1. Check if backend is running
2. Verify bot tokens in `.env`
3. Check bot logs: `docker-compose logs backend`
4. Restart backend: `docker-compose restart backend`

### Bot Commands Not Working
1. Clear chat history with bot
2. Send `/start` to reinitialize
3. Check user role in database
4. Verify user permissions

### Webhook Issues
If using webhooks instead of polling:
1. Verify SSL certificate
2. Check webhook URL
3. Ensure port 443 is accessible
4. Check webhook status: `/getWebhookInfo`

## 📚 Additional Resources

- [Telegram Bot API Documentation](https://core.telegram.org/bots/api)
- [node-telegram-bot-api](https://github.com/yagop/node-telegram-bot-api)
- [BotFather Commands](https://core.telegram.org/bots#6-botfather)

## 🤝 Contributing

To add new bot features:
1. Create handler in appropriate handlers folder
2. Add keyboard layout if needed
3. Register handler in bot index.js
4. Add tests
5. Update documentation

---

**Need help?** Open an issue on [GitHub](https://github.com/KBekmurod/parkent-expressV1/issues)
