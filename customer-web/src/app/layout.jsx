import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import Toast from '../components/ui/Toast';

export const metadata = {
  title: 'Parkent Express',
  description: 'Tez va qulay ovqat yetkazib berish xizmati',
  manifest: '/web/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Parkent Express',
  },
  formatDetection: { telephone: false },
  icons: {
    icon: '/web/icons/icon-192.png',
    apple: '/web/icons/icon-192.png',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#F97316',
};

export default function RootLayout({ children }) {
  return (
    <html lang="uz">
      <head>
        <link rel="manifest" href="/web/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Parkent Express" />
        <link rel="apple-touch-icon" href="/web/icons/icon-192.png" />
      </head>
      <body>
        <AuthProvider>
          <CartProvider>
            {children}
            <Toast />
          </CartProvider>
        </AuthProvider>
        {/* Service Worker ro'yxatdan o'tkazish */}
        <script dangerouslySetInnerHTML={{__html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/web/sw.js', { scope: '/web/' })
                .then(function(reg) { console.log('SW registered:', reg.scope); })
                .catch(function(err) { console.log('SW error:', err); });
            });
          }
        `}} />
      </body>
    </html>
  );
}
