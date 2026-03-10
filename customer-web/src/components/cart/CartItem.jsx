import Image from 'next/image';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { formatPrice } from '../../utils/helpers';
import { useCartContext } from '../../context/CartContext';

export default function CartItem({ item }) {
  const { updateQuantity, removeItem } = useCartContext();

  return (
    <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100">
      <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
        {item.image ? (
          <Image src={item.image} alt={typeof item.name === 'object' ? (item.name.uz || item.name.ru) : item.name} fill className="object-cover" />
        ) : (
          <div className="h-full flex items-center justify-center text-2xl">🍔</div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 text-sm truncate">
          {typeof item.name === 'object' ? (item.name.uz || item.name.ru) : item.name}
        </h4>
        <p className="text-primary-500 font-bold text-sm">{formatPrice(item.price)}</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
          className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
        >
          {item.quantity === 1 ? <Trash2 className="w-3.5 h-3.5 text-red-400" /> : <Minus className="w-3.5 h-3.5" />}
        </button>
        <span className="w-5 text-center font-semibold text-sm">{item.quantity}</span>
        <button
          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
          className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
