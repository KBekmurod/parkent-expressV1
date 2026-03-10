'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Star, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import PageWrapper from '../../../../components/layout/PageWrapper';
import VendorMenu from '../../../../components/vendor/VendorMenu';
import Spinner from '../../../../components/ui/Spinner';
import { getVendorById } from '../../../../services/vendorService';
import { getProductsByVendor } from '../../../../services/productService';

export default function VendorDetailPage() {
  const { vendorId } = useParams();
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [vendorData, productsData] = await Promise.all([
          getVendorById(vendorId),
          getProductsByVendor(vendorId),
        ]);
        setVendor(vendorData.data?.vendor || null);
        setProducts(productsData.data?.products || []);
      } catch {
        setError("Ma'lumotlarni yuklashda xatolik");
      } finally {
        setLoading(false);
      }
    };
    if (vendorId) load();
  }, [vendorId]);

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  if (error) return <div className="text-center py-16"><p className="text-red-500">{error}</p></div>;
  if (!vendor) return <div className="text-center py-16"><p className="text-gray-500">Restoran topilmadi</p></div>;

  return (
    <div>
      <div className="relative h-48 bg-gray-200">
        {vendor.image ? (
          <Image src={vendor.image} alt={vendor.name} fill className="object-cover" />
        ) : (
          <div className="h-full flex items-center justify-center text-6xl">🍽️</div>
        )}
        <Link href="/vendors" className="absolute top-4 left-4 bg-white rounded-full p-2 shadow-md">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </Link>
      </div>

      <PageWrapper>
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-gray-900">{vendor.name}</h1>
          {vendor.description && <p className="text-gray-500 mt-1">{vendor.description}</p>}
          <div className="flex items-center gap-4 mt-2">
            {vendor.rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="font-medium">{vendor.rating?.toFixed(1)}</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-gray-500">
              <Clock className="w-4 h-4" />
              <span>30-45 min</span>
            </div>
          </div>
        </div>

        <VendorMenu products={products} categories={[]} />
      </PageWrapper>
    </div>
  );
}
