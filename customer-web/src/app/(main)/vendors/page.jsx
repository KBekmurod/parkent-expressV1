'use client';
import { useState, useEffect } from 'react';
import PageWrapper from '../../../components/layout/PageWrapper';
import VendorList from '../../../components/vendor/VendorList';
import { getVendors } from '../../../services/vendorService';
import { Search } from 'lucide-react';

export default function VendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getVendors()
      .then((data) => setVendors(data.data?.vendors || []))
      .catch(() => setError('Restoranlarni yuklashda xatolik'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = vendors.filter((v) =>
    v.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageWrapper>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Restoranlar</h1>
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Restoran qidirish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
      <VendorList vendors={filtered} loading={loading} error={error} />
    </PageWrapper>
  );
}
