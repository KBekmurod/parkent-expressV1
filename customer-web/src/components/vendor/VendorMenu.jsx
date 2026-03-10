'use client';
import { useState } from 'react';
import ProductCard from '../product/ProductCard';
import ProductModal from '../product/ProductModal';

export default function VendorMenu({ products, categories }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter((p) => p.category?._id === activeCategory || p.category === activeCategory);

  return (
    <div>
      {categories && categories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === 'all' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Barchasi
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setActiveCategory(cat._id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat._id ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {cat.name?.uz || cat.name?.ru || cat.name}
            </button>
          ))}
        </div>
      )}

      {filteredProducts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Mahsulotlar topilmadi</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} onClick={() => setSelectedProduct(product)} />
          ))}
        </div>
      )}

      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  );
}
