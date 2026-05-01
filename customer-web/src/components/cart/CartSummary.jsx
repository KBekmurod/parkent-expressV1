import { formatPrice } from '../../utils/helpers';

export default function CartSummary({ total, deliveryFee = 0, itemCount }) {
  const grandTotal = total + deliveryFee;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
      <h3 className="font-semibold text-gray-900">Buyurtma xulosasi</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Mahsulotlar ({itemCount} ta)</span>
          <span>{formatPrice(total)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Yetkazib berish</span>
          <span className={deliveryFee > 0 ? 'text-gray-800 font-medium' : 'text-green-600'}>
            {deliveryFee > 0 ? formatPrice(deliveryFee) : 'Hisoblanmoqda...'}
          </span>
        </div>
        {deliveryFee > 0 && (
          <div className="border-t pt-2 flex justify-between font-bold text-gray-900">
            <span>Jami</span>
            <span className="text-orange-500">{formatPrice(grandTotal)}</span>
          </div>
        )}
        {deliveryFee === 0 && (
          <p className="text-xs text-gray-400 pt-1">
            * Yetkazib berish narxi manzil tanlanganidan keyin hisoblanadi
          </p>
        )}
      </div>
    </div>
  );
}
