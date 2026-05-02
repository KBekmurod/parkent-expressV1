'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Phone, MapPin, LogOut, Plus, Navigation, Trash2, Edit2, Check, X } from 'lucide-react';
import PageWrapper from '../../../components/layout/PageWrapper';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import { useAuthContext } from '../../../context/AuthContext';
import { addAddress, deleteAddress, updatePhone } from '../../../services/userService';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, updateUserData } = useAuthContext();
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingPhone, setEditingPhone] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  const [locating, setLocating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: '', address: '', location: null });

  const handleLogout = () => { logout(); router.push('/login'); };

  // Telefon tahrirlash
  const handleEditPhone = () => {
    setNewPhone(user?.phone || '');
    setEditingPhone(true);
  };

  const handleSavePhone = async () => {
    if (!newPhone.trim()) { toast.error('Telefon raqam kiriting'); return; }
    const cleaned = newPhone.replace(/\D/g, '');
    if (cleaned.length < 9) { toast.error('Noto\'g\'ri telefon raqam'); return; }
    try {
      const data = await updatePhone(user.id, cleaned);
      updateUserData({ phone: cleaned });
      toast.success('Telefon raqam yangilandi!');
      setEditingPhone(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Xatolik');
    }
  };

  // GPS joylashuv
  const detectLocation = () => {
    if (!navigator.geolocation) { toast.error('GPS qo\'llab-quvvatlanmaydi'); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setForm(f => ({ ...f, location: coords }));
        setLocating(false);
        toast.success('Joylashuv aniqlandi!');
      },
      () => { setLocating(false); toast.error('Joylashuvni aniqlab bo\'lmadi'); },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleAddAddress = async () => {
    if (!form.title.trim()) { toast.error('Manzil nomini tanlang'); return; }
    if (!form.location) { toast.error('GPS orqali joylashuvni aniqlang'); return; }
    setLoading(true);
    try {
      const addressData = {
        title: form.title,
        address: form.address || `${form.location.lat.toFixed(5)}, ${form.location.lng.toFixed(5)}`,
        location: form.location,
      };
      const data = await addAddress(user.id, addressData);
      const addresses = data.data?.user?.addresses || data.data?.addresses || [];
      updateUserData({ addresses });
      toast.success('Manzil qo\'shildi!');
      setShowAddressModal(false);
      setForm({ title: '', address: '', location: null });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Xatolik');
    } finally { setLoading(false); }
  };

  const handleDeleteAddress = async (index) => {
    try {
      const data = await deleteAddress(user.id, index);
      const addresses = data.data?.user?.addresses || data.data?.addresses || [];
      updateUserData({ addresses });
      toast.success('Manzil o\'chirildi');
    } catch { toast.error('O\'chirishda xatolik'); }
  };

  return (
    <PageWrapper>
      <h1 className="text-2xl font-bold text-gray-900 mb-5">Profilim</h1>

      {/* Foydalanuvchi ma'lumotlari */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-orange-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {user?.firstName} {user?.lastName}
            </h2>
          </div>
        </div>

        {/* Telefon raqam - tahrirlash */}
        <div className="border-t pt-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600">
              <Phone className="w-4 h-4 text-orange-500" />
              {editingPhone ? (
                <input
                  type="tel"
                  value={newPhone}
                  onChange={e => setNewPhone(e.target.value)}
                  placeholder="998901234567"
                  className="text-sm border border-orange-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-orange-400 w-40"
                  autoFocus
                />
              ) : (
                <span className="text-sm font-medium">
                  {user?.phone ? `+${user.phone}` : 'Telefon kiritilmagan'}
                </span>
              )}
            </div>
            {editingPhone ? (
              <div className="flex gap-2">
                <button onClick={handleSavePhone}
                  className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200">
                  <Check size={16} />
                </button>
                <button onClick={() => setEditingPhone(false)}
                  className="p-1.5 bg-red-100 text-red-500 rounded-lg hover:bg-red-200">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button onClick={handleEditPhone}
                className="flex items-center gap-1 text-xs text-orange-500 font-medium hover:text-orange-600">
                <Edit2 size={13} />
                O'zgartirish
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Manzillar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Manzillarim</h3>
          <button onClick={() => setShowAddressModal(true)}
            className="flex items-center gap-1 text-orange-500 text-sm font-medium">
            <Plus className="w-4 h-4" /> Qo'shish
          </button>
        </div>

        {(!user?.addresses || user.addresses.length === 0) ? (
          <div className="text-center py-4">
            <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Manzillar yo'q</p>
            <p className="text-xs text-gray-400 mt-1">GPS bilan manzil qo'shib tez buyurtma bering</p>
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
                    <a href={`https://www.google.com/maps?q=${addr.location.lat},${addr.location.lng}`}
                      target="_blank" rel="noopener noreferrer"
                      className="text-xs text-blue-500 underline">🗺️ Xaritada ko'rish</a>
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

      <Button onClick={handleLogout} variant="outline" fullWidth
        className="border-red-300 text-red-500 hover:bg-red-50">
        <LogOut className="w-4 h-4 mr-2" /> Chiqish
      </Button>

      {/* Manzil qo'shish modali */}
      <Modal isOpen={showAddressModal}
        onClose={() => { setShowAddressModal(false); setForm({ title: '', address: '', location: null }); }}
        title="Manzil qo'shish">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Manzil nomi *</label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {[{icon:'🏠',label:'Uy'},{icon:'🏢',label:'Ish'},{icon:'📍',label:'Boshqa'}].map(t => (
                <button key={t.label} onClick={() => setForm(f => ({ ...f, title: t.label }))}
                  className={`py-2 rounded-xl text-sm border transition-colors ${
                    form.title === t.label
                      ? 'border-orange-400 bg-orange-50 text-orange-700 font-medium'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
            <input type="text" placeholder="Yoki o'zingiz yozing..."
              value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>

          {/* GPS */}
          <button onClick={detectLocation} disabled={locating}
            className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-orange-300 bg-orange-50 rounded-xl text-sm text-orange-600 font-medium hover:bg-orange-100 disabled:opacity-60">
            <Navigation className={`w-4 h-4 ${locating ? 'animate-spin' : ''}`} />
            {locating ? 'Aniqlanmoqda...' : '📍 GPS bilan joylashuvni aniqlash (majburiy)'}
          </button>

          {form.location && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3">
              <p className="text-xs font-medium text-green-700 mb-1">✅ Joylashuv aniqlandi</p>
              <p className="text-xs text-green-600 font-mono">
                {form.location.lat.toFixed(6)}, {form.location.lng.toFixed(6)}
              </p>
              <a href={`https://www.google.com/maps?q=${form.location.lat},${form.location.lng}`}
                target="_blank" rel="noopener noreferrer"
                className="text-xs text-blue-500 underline mt-1 block">🗺️ Google Maps'da ko'rish</a>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Qo'shimcha tavsif</label>
            <input type="text" placeholder="Ko'cha nomi, uy raqami, mo'ljal..."
              value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>

          <Button onClick={handleAddAddress} variant="primary" fullWidth loading={loading}
            disabled={!form.title.trim() || !form.location}>
            {!form.location ? '📍 Avval GPS bilan joylashuvni aniqlang' : 'Saqlash'}
          </Button>
        </div>
      </Modal>
    </PageWrapper>
  );
}
