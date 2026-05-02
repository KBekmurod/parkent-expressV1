'use client';
import Link from 'next/link';
import { ShoppingCart, User } from 'lucide-react';
import { useCartContext } from '../../context/CartContext';
import { useAuthContext } from '../../context/AuthContext';

/* ─── Horizontal Wordmark — faqat PNG ────────────────────────────────────── */
function HorizontalWordmark() {
  return (
    <div className="flex items-center gap-2.5 px-1">
      {/* PNG ikonka — gradient fon ichida */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          background: 'linear-gradient(135deg, #FF6B00 0%, #CC2200 100%)',
          boxShadow: '0 2px 10px rgba(200,34,0,0.30)',
        }}
      >
        <img
          src="/icons/icon-192.png"
          alt="Parkent Express"
          className="w-7 h-7 object-contain"
        />
      </div>

      {/* Matn: PARKENT (Deep Navy) + EXPRESS (to'q qizil) */}
      <div className="flex flex-col leading-none gap-px">
        <span
          className="font-black tracking-widest"
          style={{ color: '#09264B', fontSize: '0.80rem', letterSpacing: '0.09em' }}
        >
          PARKENT
        </span>
        <span
          className="font-black tracking-widest"
          style={{ color: '#CC2200', fontSize: '0.80rem', letterSpacing: '0.09em' }}
        >
          EXPRESS
        </span>
      </div>
    </div>
  );
}

export default function Navbar() {
  const { count } = useCartContext();
  const { isAuthenticated } = useAuthContext();

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/home" className="flex items-center">
          <HorizontalWordmark />
        </Link>

        <div className="flex items-center gap-1">
          <Link href="/cart" className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
            <ShoppingCart className="w-6 h-6 text-gray-700" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
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
