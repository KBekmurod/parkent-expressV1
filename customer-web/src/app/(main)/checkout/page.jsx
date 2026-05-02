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
import { ADMIN_TELEGRAM } from '../../../utils/constants';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, total, count, clearCart } = useCartContext();
  const { user } = useAuthContext();
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(false);

  const deliveryFee = selectedAddress?.deliveryFee || 0;
  const grandTotal = total + deliveryFee;

  const handleOrder = async () => {
    if (!selectedAddress) {
      toast.error('Iltimos, yetkazib berish manzilini tanlang');
      return;
    }
    if (cart.length === 0) {
      toast.error("Savatcha bo'sh");
      return;
    }
    if (!user?.id) {
      toast.error('Iltimos, avval tizimga kiring');
      router.push('/login');
      return;
    }

    const vendorIds = [...new Set(
      cart.map((item) => item.vendorId?.toString?.() || item.vendorId).filter(Boolean)
    )];

    if (vendorIds.length === 0) {
      toast.error('Mahsulotlarda restoran ma\'lumoti topilmadi. Savatchani tozalab qayta urinib ko\'ring.');
      return;
    }
    if (vendorIds.length > 1) {
      toast.error('Bitta restorandan buyurtma bering');
      return;
    }

    const deliveryAddr = {
      address: selectedAddress.address?.trim() || 'Manzil kiritilmagan',
      title: selectedAddress.title || 'Manzil',
      location: selectedAddress.location || { lat: 41.2995, lng: 69.2401 },
    };

    setLoading(true);
    try {
      const orderData = {
        customer: user.id,
        vendor: vendorIds[0],
        items: cart.map((item) => ({
          product: item.productId,
          quantity: item.quantity,
        })),
        deliveryAddress: deliveryAddr,
        paymentMethod,
        deliveryFee,
        totalAmount: grandTotal,
        source: 'web',
      };

      const response = await createOrder(orderData);
      const orderId = response?.data?.order?._id || response?.order?._id;

      clearCart();
      toast.success('Buyurtma muvaffaqiyatli berildi!');

      // Karta to'lov - Telegram deep link
      if (paymentMethod === 'card_to_driver' && orderId) {
        const itemsList = cart.map(i => {
          const n = i.name;
          const name = typeof n === 'object' ? (n?.uz || n?.ru || 'Mahsulot') : (n || 'Mahsulot');
          return `${name} x${i.quantity}`;
        }).join(', ');
        const text = encodeURIComponent(
          `Salom! Buyurtma #${orderId} uchun karta orqali to'lov qilmoqchiman.\n` +
          `Mahsulotlar: ${itemsList}\n` +
          `Jami: ${new Intl.NumberFormat('uz-UZ').format(grandTotal)} so'm`
        );
        const telegramUrl = `https://t.me/${ADMIN_TELEGRAM}?text=${text}`;

        // 1 soniya kutib Telegram'ni ochish
        setTimeout(() => {
          window.open(telegramUrl, '_blank');
        }, 1000);
      }

      router.push(orderId ? `/orders/${orderId}` : '/orders');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Buyurtma berishda xatolik';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <h1 className="text-2xl font-bold text-gray-900 mb-5">Buyurtma berish</h1>

      <div className="space-y-4">
        {/* Manzil */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <AddressSelector onSelect={setSelectedAddress} selected={selectedAddress} />
        </div>

        {/* To'lov */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <PaymentSelector selected={paymentMethod} onSelect={setPaymentMethod} />
        </div>

        {/* Xulosa */}
        <CartSummary total={total} deliveryFee={deliveryFee} itemCount={count} />

        {/* Qaytim so'rash - naqd pul uchun */}
        {paymentMethod === 'cash' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs text-yellow-700">
            💡 Kuryer chegirma qaytim bera olmasligi mumkin. Iltimos, aniq pul tayyorlab qo'ying.
          </div>
        )}

        <Button
          onClick={handleOrder}
          variant="primary"
          fullWidth
          size="lg"
          loading={loading}
          disabled={!selectedAddress || loading}
        >
          {paymentMethod === 'card_to_driver'
            ? `Buyurtma berish (${new Intl.NumberFormat('uz-UZ').format(grandTotal)} so'm)`
            : `Buyurtma berish`}
        </Button>

        {!selectedAddress && (
          <p className="text-center text-xs text-gray-400">
            Manzilni tanlang yoki joylashuvingizni aniqlang
          </p>
        )}
      </div>
    </PageWrapper>
  );
}
