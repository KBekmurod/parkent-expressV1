import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import Toast from '../components/ui/Toast';

export const metadata = {
  title: 'Parkent Express',
  description: 'Tez va qulay ovqat yetkazib berish xizmati',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="uz">
      <body>
        <AuthProvider>
          <CartProvider>
            {children}
            <Toast />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
