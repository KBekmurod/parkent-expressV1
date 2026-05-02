'use client';
import Link from 'next/link';
import { ShoppingCart, User } from 'lucide-react';
import { useCartContext } from '../../context/CartContext';
import { useAuthContext } from '../../context/AuthContext';

/* ─── Mini Icon (gradient + oq kuryer) ───────────────────────────────────── */
function MiniCourier() {
  return (
    <svg viewBox="0 0 512 512" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M48 220 L155 220" stroke="rgba(255,255,255,0.75)" strokeWidth="22" strokeLinecap="round"/>
      <path d="M60 252 L148 252" stroke="rgba(255,255,255,0.50)" strokeWidth="16" strokeLinecap="round"/>
      <circle cx="315" cy="118" r="35" fill="white"/>
      <path d="M297 155 Q292 200 278 245 Q270 268 262 290"
            stroke="white" strokeWidth="30" strokeLinecap="round"/>
      <path d="M307 178 Q350 160 375 150" stroke="white" strokeWidth="24" strokeLinecap="round"/>
      <rect x="363" y="118" width="76" height="62" rx="10" fill="white"/>
      <line x1="363" y1="145" x2="439" y2="145" stroke="rgba(200,60,0,0.3)" strokeWidth="4"/>
      <line x1="401" y1="118" x2="401" y2="180" stroke="rgba(200,60,0,0.3)" strokeWidth="4"/>
      <path d="M268 288 Q262 335 257 375 Q253 398 247 416"
            stroke="white" strokeWidth="26" strokeLinecap="round"/>
      <path d="M273 286 Q290 325 306 355 Q316 376 318 398"
            stroke="white" strokeWidth="24" strokeLinecap="round"/>
      <path d="M243 412 Q231 428 217 430 Q203 432 200 422"
            stroke="white" strokeWidth="20" strokeLinecap="round"/>
      <path d="M316 396 Q332 408 345 406 Q358 404 358 394"
            stroke="white" strokeWidth="20" strokeLinecap="round"/>
    </svg>
  );
}

/* ─── Horizontal Wordmark ─────────────────────────────────────────────────── */
/* Dizayn: gradient kvadrat + kuryer + PARKENT (qovoq ko'k) / EXPRESS (qizil) */
function HorizontalWordmark() {
  return (
    <div className="flex items-center gap-2.5 px-1">
      {/* Ikonka */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          background: 'linear-gradient(135deg, #FF6B00 0%, #CC2200 100%)',
          boxShadow: '0 2px 10px rgba(200,34,0,0.30)',
        }}
      >
        <MiniCourier />
      </div>

      {/* Matn: PARKENT (to'q ko'k) + EXPRESS (to'q qizil) */}
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
