import { formatPrice } from '../../utils/helpers';

export default function CartSummary({ total, deliveryFee = 0, itemCount }) {
  const subtotal = total;
  const grandTotal = subtotal + deliveryFee;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
      <h3 className="font-semibold text-gray-900">Buyurtma xulosa</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Mahsulotlar ({itemCount} ta)</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Yetkazib berish</span>
          <span>{deliveryFee > 0 ? formatPrice(deliveryFee) : 'Bepul'}</span>
        </div>
        <div className="border-t pt-2 flex justify-between font-bold text-gray-900">
          <span>Jami</span>
          <span className="text-primary-500">{formatPrice(grandTotal)}</span>
        </div>
      </div>
    </div>
  );
}
