'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '../../../context/AuthContext';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { validatePhone, validatePin } from '../../../utils/validators';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { login, register } = useAuthContext();
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ phone: '', pin: '', firstName: '', lastName: '' });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!validatePhone(form.phone)) newErrors.phone = "To'g'ri telefon raqam kiriting";
    if (!validatePin(form.pin)) newErrors.pin = "PIN 6 ta raqamdan iborat bo'lishi kerak";
    if (mode === 'register' && !form.firstName?.trim()) newErrors.firstName = "Ismingizni kiriting";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.phone, form.pin);
        toast.success("Xush kelibsiz!");
        router.push('/home');
      } else {
        await register(form.phone, form.pin, form.firstName, form.lastName);
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
      {/* Yuqori qizil band + orqaga tugma */}
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
        <div className="flex items-center gap-3 flex-1">
          <img
            src="/icons/logo-white.svg"
            alt="Parkent Express"
            className="h-10 w-auto object-contain drop-shadow"
          />
          <div className="flex flex-col leading-none">
            <span className="text-white font-black tracking-widest text-sm">PARKENT</span>
            <span className="text-white/85 font-black tracking-widest text-sm">EXPRESS</span>
          </div>
        </div>
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
              <Input label="Ism" name="firstName" placeholder="Isming"
                value={form.firstName} onChange={handleChange} error={errors.firstName} required />
              <Input label="Familiya" name="lastName" placeholder="Familiyangiz"
                value={form.lastName} onChange={handleChange} />
            </div>
          )}

          <Input label="Telefon raqam" name="phone" type="tel" placeholder="+998901234567"
            value={form.phone} onChange={handleChange} error={errors.phone} required />

          <div>
            <Input label="PIN kod (6 ta raqam)" name="pin" type="password" placeholder="••••••"
              value={form.pin} onChange={handleChange} error={errors.pin} maxLength={6} required />
            {!errors.pin && (
              <p className="text-xs mt-1.5 ml-1" style={{ color: '#A0AEC0' }}>
                {mode === 'register'
                  ? "Yodlash oson 6 xonali kod o'ylang (tug'ilgan sana kabi)"
                  : "Ro'yxatdan o'tishda kiritgan PIN kodingiz"}
              </p>
            )}
          </div>

          <Button type="submit" variant="primary" fullWidth loading={loading} size="lg" className="mt-2">
            {mode === 'login' ? 'Kirish' : "Ro'yxatdan o'tish"}
          </Button>
        </form>

        {/* Mehmon sifatida davom etish */}
        <div className="mt-5 text-center">
          <button
            onClick={() => router.push('/home')}
            className="text-sm font-medium transition-colors hover:opacity-70"
            style={{ color: '#A0AEC0' }}
          >
            Hozircha kirmasdan ko'rish →
          </button>
        </div>
      </div>
    </div>
  );
}
