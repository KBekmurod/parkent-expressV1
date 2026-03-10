import Link from 'next/link';
import Image from 'next/image';
import { Star, Clock } from 'lucide-react';

export default function VendorCard({ vendor }) {
  return (
    <Link href={`/vendors/${vendor._id}`} className="block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-40 bg-gray-100">
        {vendor.image ? (
          <Image src={vendor.image} alt={vendor.name} fill className="object-cover" />
        ) : (
          <div className="h-full flex items-center justify-center text-4xl">🍽️</div>
        )}
        {vendor.isOpen === false && (
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <span className="bg-white text-gray-800 font-semibold px-3 py-1 rounded-full text-sm">Yopiq</span>
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-gray-900 text-base">{vendor.name}</h3>
        {vendor.description && (
          <p className="text-gray-500 text-sm mt-0.5 line-clamp-1">{vendor.description}</p>
        )}
        <div className="flex items-center gap-3 mt-2">
          {vendor.rating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-medium">{vendor.rating?.toFixed(1)}</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-gray-500">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-sm">30-45 min</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
