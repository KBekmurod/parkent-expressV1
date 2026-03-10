import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import Toast from '../components/ui/Toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Parkent Express',
  description: 'Tez va qulay ovqat yetkazib berish xizmati',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({ children }) {
  return (
    <html lang="uz">
      <body className={inter.className}>
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
