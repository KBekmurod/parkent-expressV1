'use client';
import { useAuthContext } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import BottomNav from '../../components/layout/BottomNav';
import { FullPageSpinner } from '../../components/ui/Spinner';

export default function MainLayout({ children }) {
  const { isAuthenticated, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) return <FullPageSpinner />;
  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pb-20">{children}</main>
      <BottomNav />
    </div>
  );
}
