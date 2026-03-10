'use client';
import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { useAuthContext } from '../../context/AuthContext';

export default function AddressSelector({ onSelect, selected }) {
  const { user } = useAuthContext();
  const [customAddress, setCustomAddress] = useState('');

  const addresses = user?.addresses || [];

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-900">Yetkazib berish manzili</h3>

      {addresses.map((addr, i) => (
        <button
          key={i}
          onClick={() => onSelect(addr)}
          className={`w-full flex items-start gap-3 p-3 rounded-xl border transition-colors ${
            selected?.address === addr.address
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <MapPin className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
          <div className="text-left">
            <p className="font-medium text-sm text-gray-900">{addr.title}</p>
            <p className="text-sm text-gray-500 mt-0.5">{addr.address}</p>
          </div>
        </button>
      ))}

      <div className="border border-dashed border-gray-300 rounded-xl p-3">
        <p className="text-sm text-gray-500 mb-2">Yangi manzil kiriting:</p>
        <input
          type="text"
          placeholder="Manzilni kiriting..."
          value={customAddress}
          onChange={(e) => {
            setCustomAddress(e.target.value);
            if (e.target.value) {
              onSelect({ address: e.target.value, title: 'Yangi manzil' });
            }
          }}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
    </div>
  );
}
