const CardPayment = require('../models/CardPayment.model');

const calculateDailyCollection = async (driverId, date = new Date()) => {
  const startOfDay = new Date(date).setHours(0,0,0,0);
  const endOfDay = new Date(date).setHours(23,59,59,999);

  const payments = await CardPayment.find({
    driverId,
    createdAt: { $gte: startOfDay, $lte: endOfDay }
  }).populate('orderId');

  const total = payments.reduce((sum, p) => sum + p.amount, 0);

  return { totalAmount: total, paymentCount: payments.length, payments };
};

const getDriverPendingSettlement = async (driverId) => {
  const payments = await CardPayment.find({
    driverId,
    settlementStatus: 'pending'
  }).populate('orderId');

  return {
    totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
    paymentCount: payments.length,
    payments
  };
};

const driverConfirmSettlement = async (driverId) => {
  const payments = await CardPayment.find({ driverId, settlementStatus: 'pending' });
  
  for (const payment of payments) {
    payment.driverConfirmedSettlement = true;
    payment.driverConfirmedAt = new Date();
    await payment.save();
  }

  return { success: true, count: payments.length };
};

module.exports = { calculateDailyCollection, getDriverPendingSettlement, driverConfirmSettlement };
