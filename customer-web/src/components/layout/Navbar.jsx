'use client';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, User } from 'lucide-react';
import { useCartContext } from '../../context/CartContext';
import { useAuthContext } from '../../context/AuthContext';

export default function Navbar() {
  const { count } = useCartContext();
  const { isAuthenticated } = useAuthContext();

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/home" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
            <img src="/web/icons/icon-192.png" alt="Parkent Express" className="w-full h-full object-cover" />
          </div>
          <span className="font-bold text-orange-500 text-lg">Parkent Express</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/cart" className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
            <ShoppingCart className="w-6 h-6 text-gray-700" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {count > 9 ? '9+' : count}
              </span>
            )}
          </Link>
          <Link href={isAuthenticated ? '/profile' : '/login'} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <User className="w-6 h-6 text-gray-700" />
          </Link>
        </div>
      </div>
    </nav>
  );
}
