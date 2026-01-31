# Socket.io Real-time Communication

This directory contains the Socket.io real-time communication infrastructure for Parkent Express.

## 📁 Directory Structure

```
socket/
├── index.js                     # Socket.io server initialization
├── middleware/
│   └── socketAuth.js            # JWT authentication middleware
├── handlers/
│   ├── order.handler.js         # Order tracking events
│   ├── location.handler.js      # Driver location tracking
│   ├── chat.handler.js          # Real-time chat system
│   └── notification.handler.js  # Push notifications
└── utils/
    └── broadcast.js             # Utility functions for broadcasting
```

## 🚀 Features

### 1. Real-time Order Tracking
- Join/leave order-specific rooms
- Real-time status updates broadcast to all parties
- Order timeline tracking
- Access control per user type

### 2. Driver Location Tracking
- Live driver location updates (GPS coordinates)
- Automatic broadcast to active orders
- Start/stop tracking for customers
- Driver online/offline status

### 3. Chat System
- Order-specific chat rooms
- Typing indicators
- Read receipts
- Multi-party communication (customer-vendor-driver)

### 4. Notifications
- Real-time push notifications
- User-specific notification channels
- Mark as read functionality
- Unread count tracking

### 5. Authentication & Security
- JWT token-based authentication
- Multi-model user support (Admin, Customer, Vendor, Driver)
- Room-based access control
- Active user status validation

## 🔌 Integration

### Server Setup

The Socket.io server is automatically initialized in `server.js`:

```javascript
const { initSocket } = require('./src/socket');
const server = http.createServer(app);
const io = initSocket(server);
app.set('io', io);
```

### Using Broadcast Utilities in Controllers

```javascript
const { 
  broadcastOrderStatus, 
  sendNotification,
  broadcastDriverLocation 
} = require('../socket');

// Example: Broadcast order status change
exports.updateOrderStatus = async (req, res) => {
  const order = await Order.findById(req.params.id);
  order.status = req.body.status;
  await order.save();
  
  // Broadcast to all parties
  broadcastOrderStatus(order._id, order.status, order);
  
  res.json({ success: true, order });
};

// Example: Send notification
sendNotification('customer', customerId, {
  title: 'Order Ready!',
  message: 'Your order is ready for pickup',
  type: 'success'
});

// Example: Broadcast driver location
const activeOrderIds = ['order1', 'order2'];
broadcastDriverLocation(driverId, { lat: 41.29, lng: 69.24 }, activeOrderIds);
```

## 🏠 Room Structure

| Room Pattern | Description | Members |
|-------------|-------------|---------|
| `order:{orderId}` | Order-specific updates | Customer, Vendor, Driver, Admin |
| `customer:{customerId}` | Customer-specific notifications | Customer |
| `vendor:{vendorId}` | Vendor-specific notifications | Vendor |
| `driver:{driverId}` | Driver-specific notifications | Driver |
| `admin:{adminId}` | Admin-specific notifications | Admin |
| `driver-location:{driverId}` | Driver location tracking | Customers tracking this driver |

## 📡 Client Events

### Order Events
- `order:join` - Join an order room
- `order:leave` - Leave an order room
- `order:status` - Request current order status

### Location Events (Driver)
- `location:update` - Update driver location
- `location:start-tracking` - Start tracking driver
- `location:stop-tracking` - Stop tracking driver

### Chat Events
- `chat:send` - Send a message
- `chat:typing` - Send typing indicator
- `chat:read` - Mark message as read

### Notification Events
- `notification:subscribe` - Subscribe to notifications
- `notification:read` - Mark notification as read
- `notification:count` - Get unread count

## 📥 Server Events

### Order Events
- `order:joined` - Successfully joined order room
- `order:left` - Successfully left order room
- `order:status:update` - Current order status
- `order:status:changed` - Order status changed
- `order:update` - General order update

### Location Events
- `location:updated` - Location update confirmed
- `location:tracking-started` - Started tracking driver
- `location:tracking-stopped` - Stopped tracking driver
- `driver:location:update` - Driver location update

### Chat Events
- `chat:sent` - Message sent confirmation
- `chat:message` - New message received
- `chat:typing` - Someone is typing
- `chat:read` - Message was read

### Notification Events
- `notification:subscribed` - Subscribed to notifications
- `notification` - New notification
- `notification:read:success` - Notification marked as read
- `notification:count` - Unread notification count

### Error Events
- `error` - General error message

## 🔒 Authentication

Socket connections require a valid JWT token in the `auth` handshake:

```javascript
const socket = io('http://localhost:5000', {
  auth: {
    token: 'YOUR_JWT_TOKEN'
  }
});
```

The middleware checks all user types (Admin, Customer, Vendor, Driver) concurrently and attaches user information to the socket:

```javascript
socket.user = {
  id: 'userId',
  type: 'customer', // or 'vendor', 'driver', 'admin'
  data: { ...userData }
};
```

## 📝 Usage Examples

See [SOCKET_IO_USAGE.md](../../docs/SOCKET_IO_USAGE.md) for comprehensive usage examples and best practices.

## 🧪 Testing

Run the integration tests:

```bash
cd backend
node tests/socket.test.js
```

## 📚 API Documentation

### Broadcast Utilities

#### `broadcastOrderStatus(orderId, status, order)`
Broadcasts order status change to all relevant parties.

**Parameters:**
- `orderId` (string): Order ID
- `status` (string): New order status
- `order` (object): Populated order object with customer, vendor, driver

**Example:**
```javascript
broadcastOrderStatus('12345', 'delivered', order);
```

#### `sendNotification(userType, userId, notification)`
Sends a notification to a specific user.

**Parameters:**
- `userType` (string): Type of user ('customer', 'vendor', 'driver', 'admin')
- `userId` (string): User ID
- `notification` (object): Notification data with title, message, type

**Example:**
```javascript
sendNotification('customer', 'customerId', {
  title: 'Order Update',
  message: 'Your order is on the way!',
  type: 'info'
});
```

#### `broadcastDriverLocation(driverId, location, orderIds)`
Broadcasts driver location to multiple orders.

**Parameters:**
- `driverId` (string): Driver ID
- `location` (object): Location with lat, lng
- `orderIds` (array): Array of order IDs to notify

**Example:**
```javascript
broadcastDriverLocation('driverId', { lat: 41.29, lng: 69.24 }, ['orderId1', 'orderId2']);
```

## 🐛 Troubleshooting

### Connection Issues
1. Verify JWT token is valid and not expired
2. Check CORS configuration in `.env` (CORS_ORIGIN)
3. Ensure MongoDB is running and connected
4. Check firewall rules for WebSocket connections

### Message Not Received
1. Verify user has joined the appropriate room
2. Check access permissions for the order/resource
3. Confirm socket is connected (`socket.connected`)
4. Check server logs for errors

### Authentication Failures
1. Ensure JWT_SECRET is correctly set in `.env`
2. Verify user exists in one of the user collections
3. Check user status is 'active'
4. Confirm token format: `Bearer <token>` or just `<token>`

## 🔄 Future Enhancements

- [ ] Message persistence (add Message model)
- [ ] Notification persistence (add Notification model)
- [ ] Message history retrieval
- [ ] Voice/video call signaling
- [ ] File sharing in chat
- [ ] Push notification integration (FCM/APNS)
- [ ] Socket connection analytics
- [ ] Rate limiting for events
- [ ] Message encryption

## 📄 License

Part of Parkent Express project - MIT License
