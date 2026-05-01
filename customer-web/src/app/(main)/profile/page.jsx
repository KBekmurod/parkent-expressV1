'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Phone, MapPin, LogOut, Plus, Navigation, Trash2 } from 'lucide-react';
import PageWrapper from '../../../components/layout/PageWrapper';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import { useAuthContext } from '../../../context/AuthContext';
import { addAddress, deleteAddress } from '../../../services/userService';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, updateUserData } = useAuthContext();
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [locating, setLocating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    address: '',
    location: null,
  });

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // GPS bilan joylashuvni aniqlash
  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Brauzeringiz joylashuvni aniqlay olmaydi');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setForm(f => ({
          ...f,
          location: coords,
          address: f.address || `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`,
        }));
        setLocating(false);
        toast.success('Joylashuv aniqlandi!');
      },
      () => {
        setLocating(false);
        toast.error('Joylashuvni aniqlab bo\'lmadi');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleAddAddress = async () => {
    if (!form.title.trim()) {
      toast.error('Manzil nomini kiriting (Uy, Ish, ...)');
      return;
    }
    if (!form.location && !form.address.trim()) {
      toast.error('GPS yoki manzil kiriting');
      return;
    }
    setLoading(true);
    try {
      const addressData = {
        title: form.title,
        address: form.address || `${form.location.lat.toFixed(5)}, ${form.location.lng.toFixed(5)}`,
        location: form.location || { lat: 41.2995, lng: 69.2401 },
      };
      const data = await addAddress(user.id, addressData);
      const addresses = data.data?.user?.addresses || data.data?.addresses || data.addresses || [];
      updateUserData({ addresses });
      toast.success('Manzil qo\'shildi!');
      setShowAddressModal(false);
      setForm({ title: '', address: '', location: null });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (index) => {
    try {
      const data = await deleteAddress(user.id, index);
      const addresses = data.data?.user?.addresses || data.data?.addresses || data.addresses || [];
      updateUserData({ addresses });
      toast.success('Manzil o\'chirildi');
    } catch {
      toast.error('O\'chirishda xatolik');
    }
  };

  return (
    <PageWrapper>
      <h1 className="text-2xl font-bold text-gray-900 mb-5">Profilim</h1>

      {/* Foydalanuvchi ma'lumotlari */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-orange-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {user?.firstName} {user?.lastName}
            </h2>
            <div className="flex items-center gap-2 text-gray-500 mt-1">
              <Phone className="w-4 h-4" />
              <span className="text-sm">{user?.phone || 'Telefon kiritilmagan'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Manzillar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Manzillarim</h3>
          <button
            onClick={() => setShowAddressModal(true)}
            className="flex items-center gap-1 text-orange-500 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Qo'shish
          </button>
        </div>

        {(!user?.addresses || user.addresses.length === 0) ? (
          <div className="text-center py-4">
            <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Manzillar yo'q</p>
            <p className="text-xs text-gray-400 mt-1">
              Tezroq buyurtma berish uchun manzil saqlang
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {user.addresses.map((addr, i) => (
              <div key={i} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                <MapPin className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{addr.title}</p>
                  <p className="text-xs text-gray-500">{addr.address}</p>
                  {addr.location?.lat && (
                    <a
                      href={`https://www.google.com/maps?q=${addr.location.lat},${addr.location.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 underline"
                    >
                      🗺️ Xaritada ko'rish
                    </a>
                  )}
                </div>
                <button onClick={() => handleDeleteAddress(i)}
                  className="text-gray-300 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Button
        onClick={handleLogout}
        variant="outline"
        fullWidth
        className="border-red-300 text-red-500 hover:bg-red-50"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Chiqish
      </Button>

      {/* Manzil qo'shish modali */}
      <Modal
        isOpen={showAddressModal}
        onClose={() => { setShowAddressModal(false); setForm({ title: '', address: '', location: null }); }}
        title="Manzil qo'shish"
      >
        <div className="space-y-4">
          {/* Manzil nomi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Manzil nomi *
            </label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {['Uy', 'Ish', 'Boshqa'].map(t => (
                <button key={t} onClick={() => setForm(f => ({ ...f, title: t }))}
                  className={`py-2 rounded-lg text-sm border transition-colors ${
                    form.title === t
                      ? 'border-orange-400 bg-orange-50 text-orange-700 font-medium'
                      : 'border-gray-200 text-gray-600'
                  }`}>
                  {t === 'Uy' ? '🏠' : t === 'Ish' ? '🏢' : '📍'} {t}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Yoki o'zingiz yozing..."
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* GPS tugmasi */}
          <button
            onClick={detectLocation}
            disabled={locating}
            className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-orange-300 bg-orange-50 rounded-xl text-sm text-orange-600 font-medium hover:bg-orange-100 disabled:opacity-60"
          >
            <Navigation className={`w-4 h-4 ${locating ? 'animate-spin' : ''}`} />
            {locating ? 'Aniqlanmoqda...' : 'Joriy joylashuvimni aniqlash (GPS)'}
          </button>

          {/* GPS natijasi */}
          {form.location && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3">
              <p className="text-xs font-medium text-green-700 mb-1">✅ Joylashuv aniqlandi:</p>
              <p className="text-xs text-green-600 font-mono">
                {form.location.lat.toFixed(6)}, {form.location.lng.toFixed(6)}
              </p>
              <a
                href={`https://www.google.com/maps?q=${form.location.lat},${form.location.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-500 underline mt-1 block"
              >
                🗺️ Google Maps'da ko'rish
              </a>
            </div>
          )}

          {/* Qo'shimcha manzil matni */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Manzil tavsifi (ixtiyoriy)
            </label>
            <input
              type="text"
              placeholder="Ko'cha nomi, uy raqami, mo'ljal..."
              value={form.address}
              onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <p className="text-xs text-gray-400 mt-1">
              Masalan: Parkent ko'chasi, 42-uy, sariq darvoza
            </p>
          </div>

          <Button
            onClick={handleAddAddress}
            variant="primary"
            fullWidth
            loading={loading}
            disabled={!form.title.trim() || !form.location}
          >
            {!form.location ? '📍 Avval joylashuvni aniqlang' : 'Saqlash'}
          </Button>
          {!form.location && (
            <p className="text-xs text-center text-red-400">
              GPS orqali joylashuvni aniqlash majburiy
            </p>
          )}
        </div>
      </Modal>
    </PageWrapper>
  );
}
