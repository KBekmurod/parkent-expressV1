'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { getCart, saveCart, clearCart as clearCartStore, addToCart, removeFromCart, updateCartItemQuantity, getCartTotal, getCartCount } from '../store/cartStore';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCart(getCart());
    setMounted(true);
  }, []);

  const persistCart = (newCart) => {
    setCart(newCart);
    saveCart(newCart);
  };

  const addItem = (product, quantity = 1) => {
    const newCart = addToCart(cart, product, quantity);
    persistCart(newCart);
  };

  const removeItem = (productId) => {
    const newCart = removeFromCart(cart, productId);
    persistCart(newCart);
  };

  const updateQuantity = (productId, quantity) => {
    const newCart = updateCartItemQuantity(cart, productId, quantity);
    persistCart(newCart);
  };

  const clearCart = () => {
    clearCartStore();
    setCart([]);
  };

  const getItemQuantity = (productId) => {
    const item = cart.find((i) => i.productId === productId);
    return item ? item.quantity : 0;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        mounted,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getItemQuantity,
        total: getCartTotal(cart),
        count: getCartCount(cart),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCartContext = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCartContext must be used inside CartProvider');
  return ctx;
};
