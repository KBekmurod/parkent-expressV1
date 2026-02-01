# Socket.io Real-time Communication - Usage Guide

## Overview

This document describes how to use the Socket.io real-time communication system in Parkent Express.

## Client-Side Connection

### Connecting to Socket.io

```javascript
const io = require('socket.io-client');

// Connect with authentication
const socket = io('http://localhost:5000', {
  auth: {
    token: 'YOUR_JWT_TOKEN_HERE'
  },
  transports: ['websocket', 'polling']
});

// Connection events
socket.on('connect', () => {
  console.log('Connected:', socket.id);
});

socket.on('disconnect', () => {
  console.log('Disconnected');
});

socket.on('error', (error) => {
  console.error('Socket error:', error.message);
});
```

## Event Handlers

### Order Events

#### Join Order Room
```javascript
// Join an order room to receive updates
socket.emit('order:join', orderId);

socket.on('order:joined', (data) => {
  console.log('Joined order room:', data.orderId);
});
```

#### Leave Order Room
```javascript
socket.emit('order:leave', orderId);

socket.on('order:left', (data) => {
  console.log('Left order room:', data.orderId);
});
```

#### Get Order Status
```javascript
socket.emit('order:status', orderId);

socket.on('order:status:update', (data) => {
  console.log('Order status:', data.status);
  console.log('Timeline:', data.timeline);
  console.log('Order details:', data.order);
});
```

#### Listen for Status Changes
```javascript
socket.on('order:status:changed', (data) => {
  console.log('Order status changed:', data.orderId, '->', data.status);
  console.log('Timeline:', data.timeline);
});

socket.on('order:update', (data) => {
  console.log('Order update:', data.message);
});
```

### Location Events (Driver Only)

#### Update Driver Location
```javascript
// Send location update (driver only)
socket.emit('location:update', {
  lat: 41.2995,
  lng: 69.2401
});

socket.on('location:updated', (data) => {
  console.log('Location updated:', data);
});
```

#### Track Driver Location (Customer)
```javascript
// Start tracking
socket.emit('location:start-tracking', orderId);

socket.on('location:tracking-started', (data) => {
  console.log('Tracking driver:', data.driverId);
});

socket.on('driver:location:update', (data) => {
  console.log('Driver location:', data.location);
  // Update map with new location
  updateMapMarker(data.location.lat, data.location.lng);
});

// Stop tracking
socket.emit('location:stop-tracking', orderId);

socket.on('location:tracking-stopped', (data) => {
  console.log('Stopped tracking order:', data.orderId);
});
```

### Chat Events

#### Send Message
```javascript
socket.emit('chat:send', {
  orderId: 'ORDER_ID',
  message: 'Hello, how is my order?',
  recipientType: 'vendor' // or 'customer', 'driver'
});

socket.on('chat:sent', (data) => {
  console.log('Message sent:', data.messageId);
});

socket.on('chat:message', (data) => {
  console.log('New message from', data.senderType);
  console.log('Message:', data.message);
  console.log('Timestamp:', data.timestamp);
});
```

#### Typing Indicator
```javascript
// Start typing
socket.emit('chat:typing', {
  orderId: 'ORDER_ID',
  isTyping: true
});

// Stop typing
socket.emit('chat:typing', {
  orderId: 'ORDER_ID',
  isTyping: false
});

// Listen for typing
socket.on('chat:typing', (data) => {
  if (data.isTyping) {
    console.log(data.userType, 'is typing...');
  } else {
    console.log(data.userType, 'stopped typing');
  }
});
```

#### Read Receipts
```javascript
socket.emit('chat:read', {
  orderId: 'ORDER_ID',
  messageId: 'MESSAGE_ID'
});

socket.on('chat:read', (data) => {
  console.log('Message read by:', data.readBy);
});
```

### Notification Events

#### Subscribe to Notifications
```javascript
socket.emit('notification:subscribe');

socket.on('notification:subscribed', (data) => {
  console.log(data.message);
});

socket.on('notification', (data) => {
  console.log('New notification:', data.title);
  console.log('Message:', data.message);
  console.log('Type:', data.type);
});
```

#### Mark as Read
```javascript
socket.emit('notification:read', notificationId);

socket.on('notification:read:success', (data) => {
  console.log('Notification marked as read:', data.notificationId);
});
```

#### Get Unread Count
```javascript
socket.emit('notification:count');

socket.on('notification:count', (data) => {
  console.log('Unread notifications:', data.count);
});
```

## Server-Side Broadcasting

### From Controllers

```javascript
// In your order controller
const { broadcastOrderStatus, sendNotification } = require('../socket');

// Broadcast order status change
exports.updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;
  
  const order = await Order.findByIdAndUpdate(
    orderId,
    { status },
    { new: true }
  ).populate('customer vendor driver');
  
  // Broadcast to all parties
  broadcastOrderStatus(orderId, status, order);
  
  res.json({ success: true, order });
};

// Send notification
exports.notifyUser = async (req, res) => {
  const { userId, userType, title, message } = req.body;
  
  sendNotification(userType, userId, {
    title,
    message,
    type: 'info'
  });
  
  res.json({ success: true, message: 'Notification sent' });
};
```

### Broadcast Location Update

```javascript
const { broadcastDriverLocation } = require('../socket');

// When driver updates location
exports.updateDriverLocation = async (req, res) => {
  const driverId = req.user.id;
  const { lat, lng } = req.body;
  
  // Find active orders
  const orders = await Order.find({
    driver: driverId,
    status: { $in: ['assigned', 'picked_up', 'on_the_way'] }
  });
  
  const orderIds = orders.map(o => o._id.toString());
  
  // Broadcast to all active orders
  broadcastDriverLocation(driverId, { lat, lng }, orderIds);
  
  res.json({ success: true });
};
```

## Room Structure

The system uses the following room naming conventions:

- `order:{orderId}` - Order-specific room for all parties involved
- `customer:{customerId}` - Customer-specific room for private notifications
- `vendor:{vendorId}` - Vendor-specific room for private notifications
- `driver:{driverId}` - Driver-specific room for private notifications
- `admin:{adminId}` - Admin-specific room for private notifications
- `driver-location:{driverId}` - Driver location tracking room

## Error Handling

```javascript
socket.on('error', (error) => {
  console.error('Error:', error.message);
  
  // Common errors:
  // - 'Authentication token required'
  // - 'Invalid token'
  // - 'User not found'
  // - 'User account is not active'
  // - 'Order not found'
  // - 'Access denied'
  // - 'Failed to join order room'
  // etc.
});
```

## Best Practices

1. **Always authenticate**: Provide a valid JWT token when connecting
2. **Handle disconnections**: Implement reconnection logic with exponential backoff
3. **Join relevant rooms**: Only join rooms for orders you're involved with
4. **Leave rooms**: Leave rooms when no longer needed to reduce server load
5. **Handle errors**: Always listen for error events and handle them appropriately
6. **Validate data**: Validate all data before emitting events
7. **Use typing indicators**: Improve UX by showing when someone is typing
8. **Implement read receipts**: Let users know when their messages are read

## Example: Complete Order Tracking Flow

```javascript
// Customer connects and tracks order
const socket = io('http://localhost:5000', {
  auth: { token: customerToken }
});

socket.on('connect', () => {
  // Join order room
  socket.emit('order:join', orderId);
  
  // Start tracking driver
  socket.emit('location:start-tracking', orderId);
  
  // Subscribe to notifications
  socket.emit('notification:subscribe');
});

// Listen for updates
socket.on('order:status:changed', (data) => {
  updateOrderStatus(data.status);
});

socket.on('driver:location:update', (data) => {
  updateDriverMarker(data.location);
});

socket.on('chat:message', (data) => {
  displayMessage(data);
});

socket.on('notification', (data) => {
  showNotification(data);
});

// Send a message to vendor
function sendMessageToVendor(message) {
  socket.emit('chat:send', {
    orderId,
    message,
    recipientType: 'vendor'
  });
}

// Clean up on unmount
function cleanup() {
  socket.emit('order:leave', orderId);
  socket.emit('location:stop-tracking', orderId);
  socket.disconnect();
}
```

## Testing

For testing, you can use the Socket.io client library:

```bash
npm install socket.io-client
```

See the test file at `backend/tests/socket.test.js` for integration testing examples.
