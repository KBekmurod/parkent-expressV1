'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '../../../context/AuthContext';
import Button from '../../../components/ui/Button';
import { validatePin } from '../../../utils/validators';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { login, register } = useAuthContext();
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ phoneDigits: '', pin: '', firstName: '', lastName: '' });
  const [errors, setErrors] = useState({});

  // Telefon raqamni to'liq format bilan qaytarish
  const getFullPhone = () => '+998' + form.phoneDigits.replace(/\D/g, '');

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'phoneDigits') {
      // Faqat raqam, max 9 ta
      const digits = value.replace(/\D/g, '').slice(0, 9);
      setForm((prev) => ({ ...prev, phoneDigits: digits }));
    } else if (name === 'pin') {
      // Faqat raqam, max 6 ta
      const digits = value.replace(/\D/g, '').slice(0, 6);
      setForm((prev) => ({ ...prev, pin: digits }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (form.phoneDigits.replace(/\D/g, '').length < 9) {
      newErrors.phoneDigits = "9 ta raqam kiriting";
    }
    if (!validatePin(form.pin)) {
      newErrors.pin = "PIN faqat 6 ta raqamdan iborat bo'lishi kerak";
    }
    if (mode === 'register' && !form.firstName?.trim()) {
      newErrors.firstName = "Ismingizni kiriting";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const phone = getFullPhone();
    try {
      if (mode === 'login') {
        await login(phone, form.pin);
        toast.success("Xush kelibsiz!");
        router.push('/home');
      } else {
        await register(phone, form.pin, form.firstName, form.lastName);
        toast.success("Muvaffaqiyatli ro'yxatdan o'tdingiz!");
        router.push('/home');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

      {/* Yuqori gradient header */}
      <div
        className="px-5 pt-5 pb-6 flex items-center gap-3"
        style={{ background: 'linear-gradient(135deg, #E62B00 0%, #FF8C00 100%)' }}
      >
        <button
          onClick={() => router.push('/home')}
          className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors flex-shrink-0"
          aria-label="Orqaga"
        >
          <ArrowLeft size={18} className="text-white" />
        </button>
        <img
          src="/icons/logo-white.svg"
          alt="Parkent Express"
          className="h-10 w-auto object-contain"
          style={{ maxWidth: '150px' }}
        />
      </div>

      <div className="p-6">
        {/* Mode toggle */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              mode === 'login' ? 'bg-white shadow text-gray-900' : 'text-gray-400'
            }`}
          >
            Kirish
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              mode === 'register' ? 'bg-white shadow text-gray-900' : 'text-gray-400'
            }`}
          >
            Ro'yxatdan o'tish
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div className="grid grid-cols-2 gap-3">
              {/* Ism */}
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ism <span className="text-red-500">*</span>
                </label>
                <input
                  name="firstName"
                  placeholder="Isming"
                  value={form.firstName}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors ${errors.firstName ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                />
                {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>}
              </div>
              {/* Familiya */}
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">Familiya</label>
                <input
                  name="lastName"
                  placeholder="Familiyangiz"
                  value={form.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors"
                />
              </div>
            </div>
          )}

          {/* Telefon — +998 prefix + 9 ta raqam */}
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefon raqam <span className="text-red-500">*</span>
            </label>
            <div className={`flex items-center border rounded-lg overflow-hidden transition-colors focus-within:ring-2 focus-within:ring-red-400 ${errors.phoneDigits ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'}`}>
              <span
                className="px-3 py-2.5 text-sm font-semibold border-r select-none flex-shrink-0"
                style={{ color: '#0C1E3E', borderColor: '#e5e7eb', background: '#f9fafb' }}
              >
                +998
              </span>
              <input
                name="phoneDigits"
                type="tel"
                inputMode="numeric"
                placeholder="901234567"
                value={form.phoneDigits}
                onChange={handleChange}
                maxLength={9}
                className="flex-1 px-3 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent text-sm"
              />
            </div>
            {errors.phoneDigits && <p className="mt-1 text-xs text-red-600">{errors.phoneDigits}</p>}
          </div>

          {/* PIN — faqat raqam */}
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PIN kod <span className="text-red-500">*</span>
            </label>
            <input
              name="pin"
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="••••••"
              value={form.pin}
              onChange={handleChange}
              maxLength={6}
              className={`w-full px-4 py-2.5 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors ${errors.pin ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
            />
            {errors.pin ? (
              <p className="mt-1 text-xs text-red-600">{errors.pin}</p>
            ) : (
              <p className="mt-1.5 text-xs" style={{ color: '#A0AEC0' }}>
                {mode === 'register'
                  ? "Faqat 6 ta raqam — harf kiritmang (masalan: 010205)"
                  : "Ro'yxatdan o'tishda kiritgan 6 xonali raqamli PIN"}
              </p>
            )}
          </div>

          <Button type="submit" variant="primary" fullWidth loading={loading} size="lg">
            {mode === 'login' ? 'Kirish' : "Ro'yxatdan o'tish"}
          </Button>
        </form>

        <div className="mt-5 text-center">
          <button
            onClick={() => router.push('/home')}
            className="text-sm font-medium hover:opacity-70 transition-opacity"
            style={{ color: '#A0AEC0' }}
          >
            Hozircha kirmasdan ko'rish →
          </button>
        </div>
      </div>
    </div>
  );
}
