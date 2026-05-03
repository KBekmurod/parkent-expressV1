import Image from 'next/image';
import { Plus } from 'lucide-react';
import { getProductName, formatPrice } from '../../utils/helpers';
import { useCartContext } from '../../context/CartContext';

export default function ProductCard({ product, onClick }) {
  const { addItem, getItemQuantity } = useCartContext();
  const qty = getItemQuantity(product._id);

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl overflow-hidden cursor-pointer transition-shadow hover:shadow-md"
      style={{ border: '1px solid #F0F0F0', boxShadow: '0px 4px 12px rgba(0,0,0,0.05)' }}
    >
      <div className="relative h-28 bg-gray-50">
        {product.image ? (
          <Image src={product.image} alt={getProductName(product)} fill className="object-cover" />
        ) : (
          <div className="h-full flex items-center justify-center text-3xl">🍔</div>
        )}
      </div>
      <div className="p-2">
        <h4 className="font-medium text-sm line-clamp-2" style={{ color: '#0C1E3E' }}>
          {getProductName(product)}
        </h4>
        <div className="flex items-center justify-between mt-2">
          {/* Narx — brand gradient matn */}
          <span className="font-bold text-sm" style={{ color: '#E62B00' }}>
            {formatPrice(product.price)}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); addItem(product); }}
            className="w-7 h-7 rounded-full flex items-center justify-center text-white transition-all active:scale-90"
            style={{
              background: qty > 0
                ? 'linear-gradient(135deg, #E62B00, #FF8C00)'
                : 'rgba(230,43,0,0.12)',
              color: qty > 0 ? 'white' : '#E62B00',
            }}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {qty > 0 && (
          <p className="text-xs mt-1 font-medium" style={{ color: '#E62B00' }}>
            Savatchada: {qty} ta
          </p>
        )}
      </div>
    </div>
  );
}
