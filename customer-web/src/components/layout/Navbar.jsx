'use client';
import Link from 'next/link';
import { ShoppingCart, User } from 'lucide-react';
import { useCartContext } from '../../context/CartContext';
import { useAuthContext } from '../../context/AuthContext';
import { APP_NAME } from '../../utils/constants';

export default function Navbar() {
  const { count } = useCartContext();
  const { isAuthenticated } = useAuthContext();

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/home" className="flex items-center gap-2">
          <span className="text-2xl">🍕</span>
          <span className="font-bold text-primary-500 text-lg">{APP_NAME}</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/cart" className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
            <ShoppingCart className="w-6 h-6 text-gray-700" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
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
