'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PageWrapper from '../../../components/layout/PageWrapper';
import CartSummary from '../../../components/cart/CartSummary';
import AddressSelector from '../../../components/checkout/AddressSelector';
import PaymentSelector from '../../../components/checkout/PaymentSelector';
import Button from '../../../components/ui/Button';
import { useCartContext } from '../../../context/CartContext';
import { useAuthContext } from '../../../context/AuthContext';
import { createOrder } from '../../../services/orderService';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, total, count, clearCart } = useCartContext();
  const { user } = useAuthContext();
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(false);

  const handleOrder = async () => {
    if (!selectedAddress) {
      toast.error("Iltimos, yetkazib berish manzilini tanlang");
      return;
    }
    if (cart.length === 0) {
      toast.error("Savatcha bo'sh");
      return;
    }

    // Validate all cart items are from the same vendor
    const vendorIds = [...new Set(cart.map((item) => item.vendorId))];
    if (vendorIds.length > 1) {
      toast.error("Savatchangizda turli restoranlardan mahsulotlar bor. Iltimos, bitta restorandan buyurtma bering");
      return;
    }

    const vendorId = vendorIds[0];

    setLoading(true);
    try {
      const orderData = {
        customer: user.id,
        vendor: vendorId,
        items: cart.map((item) => ({
          product: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        deliveryAddress: {
          address: selectedAddress.address,
          ...(selectedAddress.location && { location: selectedAddress.location }),
        },
        paymentMethod,
        totalAmount: total,
        source: 'web',
      };

      const response = await createOrder(orderData);
      const orderId = response.data?.order?._id;
      clearCart();
      toast.success("Buyurtma muvaffaqiyatli berildi!");
      router.push(orderId ? `/orders/${orderId}` : '/orders');
    } catch (err) {
      toast.error(err.response?.data?.message || "Buyurtma berishda xatolik");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <h1 className="text-2xl font-bold text-gray-900 mb-5">Buyurtma berish</h1>

      <div className="space-y-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <AddressSelector onSelect={setSelectedAddress} selected={selectedAddress} />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <PaymentSelector selected={paymentMethod} onSelect={setPaymentMethod} />
        </div>

        <CartSummary total={total} itemCount={count} />

        <Button onClick={handleOrder} variant="primary" fullWidth size="lg" loading={loading} disabled={!selectedAddress}>
          Buyurtma berish
        </Button>
      </div>
    </PageWrapper>
  );
}
