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

        <Link href="/home" className="flex items-center gap-2.5 py-1">
          <img
            src="/icons/logo.svg"
            alt="Parkent Express"
            className="h-10 w-10 object-contain flex-shrink-0"
          />
          <div className="flex flex-col leading-none gap-0.5">
            <span className="font-black" style={{ color: '#0C1E3E', fontSize: '0.92rem', letterSpacing: '0.08em' }}>
              PARKENT
            </span>
            <span className="font-black" style={{ color: '#E62B00', fontSize: '0.92rem', letterSpacing: '0.08em' }}>
              EXPRESS
            </span>
          </div>
        </Link>

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
