'use client';
import { useState } from 'react';
import Image from 'next/image';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { getProductName, formatPrice } from '../../utils/helpers';
import { useCartContext } from '../../context/CartContext';
import { Minus, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductModal({ product, onClose }) {
  const { addItem, getItemQuantity } = useCartContext();
  const [qty, setQty] = useState(1);
  const cartQty = getItemQuantity(product._id);

  const handleAdd = () => {
    addItem(product, qty);
    toast.success(`${getProductName(product)} savatchaga qo'shildi`);
    onClose();
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={getProductName(product)} size="md">
      <div className="space-y-4">
        {product.image && (
          <div className="relative h-48 rounded-xl overflow-hidden bg-gray-100">
            <Image src={product.image} alt={getProductName(product)} fill className="object-cover" />
          </div>
        )}

        {product.description && (
          <p className="text-gray-600 text-sm">
            {typeof product.description === 'object'
              ? (product.description.uz || product.description.ru)
              : product.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-primary-500">{formatPrice(product.price)}</span>
          {product.discount > 0 && (
            <span className="bg-red-100 text-red-600 text-sm font-medium px-2 py-0.5 rounded-full">
              -{product.discount}%
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-gray-100 rounded-xl p-1">
            <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-6 text-center font-semibold">{qty}</span>
            <button onClick={() => setQty(qty + 1)} className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <Button onClick={handleAdd} variant="primary" fullWidth>
            Savatchaga qo'shish — {formatPrice(product.price * qty)}
          </Button>
        </div>

        {cartQty > 0 && (
          <p className="text-sm text-center text-gray-500">Savatchada: {cartQty} ta</p>
        )}
      </div>
    </Modal>
  );
}
