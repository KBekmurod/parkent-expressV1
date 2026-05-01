'use client';
import { useAuthContext } from '../../context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import BottomNav from '../../components/layout/BottomNav';
import { FullPageSpinner } from '../../components/ui/Spinner';

// Bu sahifalar uchun login SHART EMAS
const PUBLIC_PATHS = ['/home', '/vendors'];

export default function MainLayout({ children }) {
  const { isAuthenticated, loading } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();

  // /web prefix'ini olib tashlaymiz (basePath)
  const cleanPath = pathname?.replace('/web', '') || '/';
  const isPublic = PUBLIC_PATHS.some(p => cleanPath === p || cleanPath.startsWith(p + '/'));

  useEffect(() => {
    if (!loading && !isAuthenticated && !isPublic) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, isPublic, router]);

  if (loading) return <FullPageSpinner />;

  // Public sahifalar uchun auth kerak emas
  if (!isAuthenticated && !isPublic) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pb-20">{children}</main>
      <BottomNav />
    </div>
  );
}
