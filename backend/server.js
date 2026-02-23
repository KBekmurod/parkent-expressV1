require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const connectDB = require('./src/config/database');
const logger = require('./src/utils/logger');
const { errorHandler, notFound } = require('./src/middleware/error.middleware');
const { apiLimiter } = require('./src/middleware/rateLimit.middleware');
const { initSocket } = require('./src/socket');

const app = express();
app.set('trust proxy', 1);
const server = http.createServer(app);

// Connect to MongoDB
connectDB();

// Initialize Socket.io
const io = initSocket(server);

// Make io accessible in controllers
app.set('io', io);

// Security Middleware
app.use(helmet()); // HTTP headers security
// Parse CORS origins - support comma-separated list
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : (process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : ['http://localhost:3000']);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (corsOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS: Origin '${origin}' not allowed`));
  },
  credentials: true
}));
app.use(mongoSanitize()); // Data sanitization against NoSQL injection
app.use(xss()); // Data sanitization against XSS

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use('/api/', apiLimiter);

// Static files
app.use('/uploads', express.static('uploads'));

// Request logging in development
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`);
    next();
  });
}

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    success: true,
    status: 'OK', 
    message: 'Parkent Express Backend is running',
    socket: io ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// API info
app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: 'Parkent Express API',
    version: '1.0.0',
    socket: 'Socket.io enabled',
    docs: '/api/docs'
  });
});

// API Routes
app.use('/api/v1/auth', require('./src/routes/auth.routes'));
app.use('/api/v1/users', require('./src/routes/user.routes'));
app.use('/api/v1/vendors', require('./src/routes/vendor.routes'));
app.use('/api/v1/drivers', require('./src/routes/driver.routes'));
app.use('/api/v1/products', require('./src/routes/product.routes'));
app.use('/api/v1/orders', require('./src/routes/order.routes'));
app.use('/api/v1/reviews', require('./src/routes/review.routes'));
app.use('/api/v1/categories', require('./src/routes/category.routes'));
app.use('/api/v1/transactions', require('./src/routes/transaction.routes'));
app.use('/api/v1/stats', require('./src/routes/stats.routes'));
app.use('/api/v1/card-payments', require('./src/routes/cardPayment.routes'));
// app.use('/api/v1/admin', require('./src/routes/admin.routes'));

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  logger.info(`🔌 Socket.io ready for connections`);
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`🔌 Socket.io ready for connections`);
  
  // Initialize Telegram Bots
  const { initCustomerBot } = require('./src/bots/customer');
  const { initVendorBot } = require('./src/bots/vendor');
  const { initDriverBot } = require('./src/bots/driver');
  
  const customerBot = initCustomerBot();
  if (customerBot) {
    logger.info('✅ Customer Bot started');
    console.log('✅ Customer Bot started');
  }
  
  const vendorBot = initVendorBot();
  if (vendorBot) {
    logger.info('✅ Vendor Bot started');
    console.log('✅ Vendor Bot started');
  }
  
  const driverBot = initDriverBot();
  if (driverBot) {
    logger.info('✅ Driver Bot started');
    console.log('✅ Driver Bot started');
    
    // Initialize settlement reminder cron job
    const settlementReminderJob = require('./src/jobs/settlementReminder.job');
    settlementReminderJob.initializeBot(driverBot);
    settlementReminderJob.startSettlementReminder();
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection! Shutting down...', err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception! Shutting down...', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

module.exports = server;
