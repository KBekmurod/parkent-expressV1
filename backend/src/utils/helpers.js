/**
 * Generate unique order number
 * Format: ORD-YYYYMMDD-0001
 */
const generateOrderNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  
  return `ORD-${year}${month}${day}-${random}`;
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 * Returns distance in kilometers
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // 2 decimal places
};

const toRad = (value) => {
  return value * Math.PI / 180;
};

/**
 * Format phone number
 */
const formatPhoneNumber = (phone) => {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Format: +998 XX XXX XX XX
  if (cleaned.startsWith('998')) {
    return `+${cleaned}`;
  }
  return `+998${cleaned}`;
};

/**
 * Calculate delivery fee based on distance
 */
const calculateDeliveryFee = (distanceKm) => {
  const baseFee = 5000; // 5,000 so'm
  const perKmFee = 2000; // 2,000 so'm per km
  
  if (distanceKm <= 2) {
    return baseFee;
  }
  
  return baseFee + Math.ceil(distanceKm - 2) * perKmFee;
};

module.exports = {
  generateOrderNumber,
  calculateDistance,
  formatPhoneNumber,
  calculateDeliveryFee
};
