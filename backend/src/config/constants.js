// Order statuses
const ORDER_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  PREPARING: 'preparing',
  READY: 'ready',
  ASSIGNED: 'assigned',
  PICKED_UP: 'picked_up',
  ON_THE_WAY: 'on_the_way',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected'
};

// User statuses
const USER_STATUS = {
  ACTIVE: 'active',
  BLOCKED: 'blocked'
};

// Vendor statuses
const VENDOR_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  BLOCKED: 'blocked',
  CLOSED: 'closed'
};

// Driver statuses
const DRIVER_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  BLOCKED: 'blocked'
};

// Payment methods
const PAYMENT_METHOD = {
  CASH: 'cash',
  CARD: 'card'
};

// Transaction types
const TRANSACTION_TYPE = {
  ORDER: 'order',
  COMMISSION: 'commission',
  WITHDRAWAL: 'withdrawal',
  REFUND: 'refund'
};

// Transaction statuses
const TRANSACTION_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

// Vehicle types
const VEHICLE_TYPE = {
  BICYCLE: 'bicycle',
  MOTORCYCLE: 'motorcycle',
  CAR: 'car'
};

// Admin roles
const ADMIN_ROLE = {
  SUPER_ADMIN: 'super_admin',
  OPERATOR: 'operator',
  ACCOUNTANT: 'accountant'
};

// Platform settings
const PLATFORM_CONFIG = {
  COMMISSION_PERCENTAGE: 10, // 10%
  MAX_DRIVER_ORDERS: 3,
  MIN_ORDER_AMOUNT: 10000, // 10,000 so'm
  DEFAULT_DELIVERY_FEE: 5000 // 5,000 so'm
};

module.exports = {
  ORDER_STATUS,
  USER_STATUS,
  VENDOR_STATUS,
  DRIVER_STATUS,
  PAYMENT_METHOD,
  TRANSACTION_TYPE,
  TRANSACTION_STATUS,
  VEHICLE_TYPE,
  ADMIN_ROLE,
  PLATFORM_CONFIG
};
