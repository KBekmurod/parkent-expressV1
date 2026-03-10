const CART_KEY = 'parkent_cart';

export const getCart = () => {
  if (typeof window === 'undefined') return [];
  try {
    const cart = localStorage.getItem(CART_KEY);
    return cart ? JSON.parse(cart) : [];
  } catch {
    return [];
  }
};

export const saveCart = (cart) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
};

export const clearCart = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CART_KEY);
};

export const addToCart = (cart, product, quantity = 1) => {
  const existing = cart.find((item) => item.productId === product._id);
  if (existing) {
    return cart.map((item) =>
      item.productId === product._id
        ? { ...item, quantity: item.quantity + quantity }
        : item
    );
  }
  return [
    ...cart,
    {
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      vendorId: product.vendor,
      quantity,
    },
  ];
};

export const removeFromCart = (cart, productId) => {
  return cart.filter((item) => item.productId !== productId);
};

export const updateCartItemQuantity = (cart, productId, quantity) => {
  if (quantity <= 0) return removeFromCart(cart, productId);
  return cart.map((item) =>
    item.productId === productId ? { ...item, quantity } : item
  );
};

export const getCartTotal = (cart) => {
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
};

export const getCartCount = (cart) => {
  return cart.reduce((count, item) => count + item.quantity, 0);
};
