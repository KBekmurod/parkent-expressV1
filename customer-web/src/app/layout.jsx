import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import Toast from '../components/ui/Toast';
import InstallBanner from '../components/ui/InstallBanner';

export const metadata = {
  title: 'Parkent Express',
  description: 'Tez va qulay taom yetkazib berish xizmati',
  manifest: '/web/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Parkent Express',
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: '/web/icons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/web/icons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/web/icons/icon-192.png',      sizes: '192x192', type: 'image/png' },
    ],
    apple: '/web/icons/apple-touch-icon.png',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#E62B00',
};

export default function RootLayout({ children }) {
  return (
    <html lang="uz">
      <head>
        <link rel="manifest" href="/web/manifest.json" />
        <link rel="icon" type="image/png" sizes="32x32" href="/web/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/web/icons/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/web/icons/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Parkent Express" />
        <meta name="theme-color" content="#E62B00" />
      </head>
      <body className="bg-surface">
        <AuthProvider>
          <CartProvider>
            {children}
            <Toast />
            <InstallBanner />
          </CartProvider>
        </AuthProvider>
        <script dangerouslySetInnerHTML={{__html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/web/sw.js', { scope: '/web/' })
                .catch(function(err) { console.log('SW error:', err); });
            });
          }
        `}} />
      </body>
    </html>
  );
}
