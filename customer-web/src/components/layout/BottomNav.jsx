'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Store, ShoppingCart, ClipboardList, User } from 'lucide-react';
import { useCartContext } from '../../context/CartContext';

const navItems = [
  { href: '/home',    icon: Home,          label: 'Asosiy'      },
  { href: '/vendors', icon: Store,          label: 'Restoranlar' },
  { href: '/cart',    icon: ShoppingCart,   label: 'Savat', hasCart: true },
  { href: '/orders',  icon: ClipboardList,  label: 'Buyurtmalar' },
  { href: '/profile', icon: User,           label: 'Profil'      },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { count } = useCartContext();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 safe-area-pb"
         style={{ boxShadow: '0 -2px 12px rgba(0,0,0,0.06)' }}>
      <div className="max-w-2xl mx-auto px-2 flex items-center justify-around h-16">
        {navItems.map(({ href, icon: Icon, label, hasCart }) => {
          const isActive = pathname === href || (href === '/home' && pathname === '/');
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1 flex-1 py-2 px-1 relative transition-colors"
            >
              <div className="relative">
                <Icon
                  className="w-5 h-5"
                  style={{ color: isActive ? '#E62B00' : '#A0AEC0' }}
                />
                {hasCart && count > 0 && (
                  <span
                    className="absolute -top-1.5 -right-1.5 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #E62B00, #FF8C00)', fontSize: '9px' }}
                  >
                    {count > 9 ? '9+' : count}
                  </span>
                )}
              </div>
              <span
                className="text-xs font-medium"
                style={{ color: isActive ? '#E62B00' : '#A0AEC0' }}
              >
                {label}
              </span>
              {/* Aktiv indikator */}
              {isActive && (
                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full"
                  style={{ background: 'linear-gradient(135deg, #E62B00, #FF8C00)' }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
