import VendorCard from './VendorCard';
import Spinner from '../ui/Spinner';

export default function VendorList({ vendors, loading, error }) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  if (!vendors || vendors.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-2">🍽️</div>
        <p className="text-gray-500">Restoranlar topilmadi</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {vendors.map((vendor) => (
        <VendorCard key={vendor._id} vendor={vendor} />
      ))}
    </div>
  );
}
