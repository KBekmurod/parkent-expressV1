import Image from 'next/image';
import { Plus } from 'lucide-react';
import { getProductName, formatPrice } from '../../utils/helpers';
import { useCartContext } from '../../context/CartContext';

export default function ProductCard({ product, onClick }) {
  const { addItem, getItemQuantity } = useCartContext();
  const qty = getItemQuantity(product._id);

  const handleAdd = (e) => {
    e.stopPropagation();
    addItem(product);
  };

  return (
    <div onClick={onClick} className="bg-white rounded-xl border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
      <div className="relative h-28 bg-gray-50">
        {product.image ? (
          <Image src={product.image} alt={getProductName(product)} fill className="object-cover" />
        ) : (
          <div className="h-full flex items-center justify-center text-3xl">🍔</div>
        )}
      </div>
      <div className="p-2">
        <h4 className="font-medium text-gray-900 text-sm line-clamp-2">{getProductName(product)}</h4>
        <div className="flex items-center justify-between mt-2">
          <span className="text-primary-500 font-bold text-sm">{formatPrice(product.price)}</span>
          <button
            onClick={handleAdd}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
              qty > 0 ? 'bg-primary-500 text-white' : 'bg-primary-100 text-primary-500 hover:bg-primary-500 hover:text-white'
            }`}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {qty > 0 && <p className="text-xs text-primary-500 mt-1">Savatchada: {qty} ta</p>}
      </div>
    </div>
  );
}
