'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import PageWrapper from '../../../components/layout/PageWrapper';
import VendorList from '../../../components/vendor/VendorList';
import { getVendors } from '../../../services/vendorService';
import { useAuthContext } from '../../../context/AuthContext';
import { Search } from 'lucide-react';

export default function HomePage() {
  const { user } = useAuthContext();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const data = await getVendors();
        setVendors(data.data?.vendors || []);
      } catch (err) {
        setError('Restoranlarni yuklashda xatolik');
      } finally {
        setLoading(false);
      }
    };
    fetchVendors();
  }, []);

  const filtered = vendors.filter((v) =>
    v.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageWrapper>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Salom, {user?.firstName || 'Mehmon'}! 👋
        </h1>
        <p className="text-gray-500 mt-1">Bugun nima yemoqchisiz?</p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Restoran qidirish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">Restoranlar</h2>
          <Link href="/vendors" className="text-primary-500 text-sm font-medium">Barchasi →</Link>
        </div>
        <VendorList vendors={filtered} loading={loading} error={error} />
      </div>
    </PageWrapper>
  );
}
