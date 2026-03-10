'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Phone, MapPin, LogOut, Plus } from 'lucide-react';
import PageWrapper from '../../../components/layout/PageWrapper';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Modal from '../../../components/ui/Modal';
import { useAuthContext } from '../../../context/AuthContext';
import { addAddress } from '../../../services/userService';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, updateUserData } = useAuthContext();
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressForm, setAddressForm] = useState({ title: '', address: '' });
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!addressForm.title || !addressForm.address) {
      toast.error("Barcha maydonlarni to'ldiring");
      return;
    }
    setLoading(true);
    try {
      const data = await addAddress(user.id, {
        title: addressForm.title,
        address: addressForm.address,
        location: { lat: 41.2995, lng: 69.2401 },
      });
      updateUserData({ addresses: data.data?.addresses });
      toast.success("Manzil qo'shildi");
      setShowAddressModal(false);
      setAddressForm({ title: '', address: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <h1 className="text-2xl font-bold text-gray-900 mb-5">Profilim</h1>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-primary-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{user?.firstName} {user?.lastName}</h2>
            <div className="flex items-center gap-2 text-gray-500 mt-1">
              <Phone className="w-4 h-4" />
              <span className="text-sm">{user?.phone}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Manzillarim</h3>
          <button
            onClick={() => setShowAddressModal(true)}
            className="flex items-center gap-1 text-primary-500 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Qo'shish
          </button>
        </div>

        {(!user?.addresses || user.addresses.length === 0) ? (
          <div className="text-center py-4">
            <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Manzillar yo'q</p>
          </div>
        ) : (
          <div className="space-y-2">
            {user.addresses.map((addr, i) => (
              <div key={i} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                <MapPin className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{addr.title}</p>
                  <p className="text-xs text-gray-500">{addr.address}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Button onClick={handleLogout} variant="outline" fullWidth className="border-red-300 text-red-500 hover:bg-red-50">
        <LogOut className="w-4 h-4 mr-2" />
        Chiqish
      </Button>

      <Modal isOpen={showAddressModal} onClose={() => setShowAddressModal(false)} title="Manzil qo'shish">
        <form onSubmit={handleAddAddress} className="space-y-3">
          <Input label="Nomi" name="title" placeholder="Uy, Ish, ..." value={addressForm.title} onChange={(e) => setAddressForm((p) => ({ ...p, title: e.target.value }))} required />
          <Input label="Manzil" name="address" placeholder="Ko'cha, uy raqami..." value={addressForm.address} onChange={(e) => setAddressForm((p) => ({ ...p, address: e.target.value }))} required />
          <Button type="submit" variant="primary" fullWidth loading={loading}>Saqlash</Button>
        </form>
      </Modal>
    </PageWrapper>
  );
}
