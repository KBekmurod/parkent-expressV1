export const validatePhone = (phone) => {
  const phoneRegex = /^\+?[0-9]{9,13}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validatePin = (pin) => {
  return /^\d{6}$/.test(pin);
};

export const validateName = (name) => {
  return name && name.trim().length >= 2;
};

export const validateAddress = (address) => {
  return address && address.trim().length >= 5;
};
