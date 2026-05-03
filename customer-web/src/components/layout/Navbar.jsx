'use client';
import Link from 'next/link';
import { ShoppingCart, User } from 'lucide-react';
import { useCartContext } from '../../context/CartContext';
import { useAuthContext } from '../../context/AuthContext';

export default function Navbar() {
  const { count } = useCartContext();
  const { isAuthenticated } = useAuthContext();

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">

        {/* Logo — logo-full.svg (icon + nom birga) */}
        <Link href="/home" className="flex items-center py-1">
          <img
            src="/icons/logo-full.svg"
            alt="Parkent Express"
            className="h-10 w-auto object-contain"
            style={{ maxWidth: '160px' }}
          />
        </Link>

        {/* O'ng: savatcha + profil */}
        <div className="flex items-center gap-1">
          <Link href="/cart" className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
            <ShoppingCart className="w-6 h-6 text-gray-700" />
            {count > 0 && (
              <span
                className="absolute -top-1 -right-1 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #E62B00, #FF8C00)' }}
              >
                {count > 9 ? '9+' : count}
              </span>
            )}
          </Link>
          <Link
            href={isAuthenticated ? '/profile' : '/login'}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <User className="w-6 h-6 text-gray-700" />
          </Link>
        </div>

      </div>
    </nav>
  );
}
