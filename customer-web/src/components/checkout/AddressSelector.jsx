'use client';
import { useState, useEffect } from 'react';
import { MapPin, Navigation, Plus } from 'lucide-react';
import { useAuthContext } from '../../context/AuthContext';

// Haversine formulasi - delivery fee hisoblash uchun
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// Parkent tumani markazi (taxminiy vendor joylashuvi)
const DEFAULT_VENDOR_LOCATION = { lat: 41.2995, lng: 69.2401 };

export default function AddressSelector({ onSelect, selected, vendorLocation }) {
  const { user } = useAuthContext();
  const [locating, setLocating] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [manualAddress, setManualAddress] = useState('');
  const [mapCoords, setMapCoords] = useState(null);

  const addresses = user?.addresses || [];

  const vendor = vendorLocation || DEFAULT_VENDOR_LOCATION;

  // Delivery fee hisoblash
  const calcFee = (coords) => {
    if (!coords) return 0;
    const dist = haversineKm(vendor.lat, vendor.lng, coords.lat, coords.lng);
    return Math.min(25000, Math.max(5000, Math.round(dist * 2000)));
  };

  // Joriy joylashuvni aniqlash
  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert('Brauzeringiz joylashuvni aniqlay olmaydi');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setMapCoords(coords);
        const fee = calcFee(coords);
        onSelect({
          address: `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`,
          title: 'Joriy joylashuv',
          location: coords,
          deliveryFee: fee,
        });
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        alert('Joylashuvni aniqlab bo\'lmadi. Manzilni qo\'lda kiriting.');
        setShowManual(true);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleManualAddress = () => {
    if (!manualAddress.trim()) return;
    onSelect({
      address: manualAddress,
      title: 'Manzil',
      location: DEFAULT_VENDOR_LOCATION,
      deliveryFee: 8000,
    });
  };

  const selectSaved = (addr) => {
    const fee = calcFee(addr.location);
    onSelect({ ...addr, deliveryFee: fee });
  };

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-900">Yetkazib berish manzili</h3>

      {/* Saqlangan manzillar */}
      {addresses.length > 0 && addresses.map((addr, i) => (
        <button key={i} onClick={() => selectSaved(addr)}
          className={`w-full flex items-start gap-3 p-3 rounded-xl border transition-colors ${
            selected?.address === addr.address
              ? 'border-orange-400 bg-orange-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}>
          <MapPin className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <div className="text-left flex-1">
            <p className="font-medium text-sm text-gray-900">{addr.title}</p>
            <p className="text-xs text-gray-500">{addr.address}</p>
            {addr.location && (
              <p className="text-xs text-gray-400 mt-0.5">
                📍 {addr.location.lat?.toFixed(4)}, {addr.location.lng?.toFixed(4)}
              </p>
            )}
          </div>
        </button>
      ))}

      {/* Joriy joylashuvni aniqlash */}
      <button onClick={detectLocation} disabled={locating}
        className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed border-orange-300 bg-orange-50 hover:bg-orange-100 transition-colors disabled:opacity-60">
        <Navigation className={`w-5 h-5 text-orange-500 ${locating ? 'animate-spin' : ''}`} />
        <div className="text-left">
          <p className="font-medium text-sm text-orange-700">
            {locating ? 'Aniqlanmoqda...' : 'Joriy joylashuvimni aniqlash'}
          </p>
          <p className="text-xs text-orange-500">GPS orqali avtomatik</p>
        </div>
      </button>

      {/* Tanlangan koordinatalar - Google Maps havolasi */}
      {(selected?.location || mapCoords) && (
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs font-medium text-gray-600 mb-1">📍 Tanlangan manzil:</p>
          <p className="text-sm text-gray-800">{selected?.address || 'Joriy joylashuv'}</p>
          {(selected?.location || mapCoords) && (
            <a
              href={`https://www.google.com/maps?q=${(selected?.location || mapCoords)?.lat},${(selected?.location || mapCoords)?.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-500 underline mt-1 block"
            >
              🗺️ Google Maps'da ko'rish
            </a>
          )}
          {selected?.deliveryFee > 0 && (
            <p className="text-xs text-green-600 font-medium mt-1">
              🛵 Yetkazib berish: {new Intl.NumberFormat('uz-UZ').format(selected.deliveryFee)} so'm
            </p>
          )}
        </div>
      )}

      {/* Qo'lda kiriting */}
      <button onClick={() => setShowManual(!showManual)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
        <Plus className="w-4 h-4" />
        Manzilni qo'lda kiriting
      </button>

      {showManual && (
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Ko'cha nomi, uy raqami, mo'ljal..."
            value={manualAddress}
            onChange={(e) => setManualAddress(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <p className="text-xs text-gray-400">
            Masalan: Parkent ko'chasi, 42-uy, eski bozor yonida
          </p>
          <button onClick={handleManualAddress}
            className="w-full py-2 bg-orange-500 text-white text-sm font-medium rounded-xl hover:bg-orange-600">
            Tasdiqlash
          </button>
        </div>
      )}
    </div>
  );
}
