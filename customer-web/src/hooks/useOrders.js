'use client';
import { useState, useEffect, useCallback } from 'react';
import { getCustomerOrders, getOrderById } from '../services/orderService';

export function useOrders(userId) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getCustomerOrders(userId);
      setOrders(data.data?.orders || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Buyurtmalarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders, loading, error, refetch: fetchOrders };
}

export function useOrder(orderId) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getOrderById(orderId);
      setOrder(data.data?.order || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Buyurtmani yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  return { order, loading, error, refetch: fetchOrder };
}
