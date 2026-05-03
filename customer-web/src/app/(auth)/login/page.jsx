'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '../../../context/AuthContext';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { validatePhone, validatePin } from '../../../utils/validators';
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
    if (!validatePin(form.pin)) newErrors.pin = "PIN 4 ta raqamdan iborat bo'lishi kerak";
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
    <div className="bg-white rounded-3xl shadow-xl p-8">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8 gap-3">
        <img
          src="/icons/logo.svg"
          alt="Parkent Express"
          className="h-20 w-auto object-contain"
        />
        <div className="text-center">
          <h1 className="text-xl font-black tracking-wide" style={{ color: '#0C1E3E' }}>
            PARKENT EXPRESS
          </h1>
          <p className="text-sm mt-0.5" style={{ color: '#A0AEC0', fontStyle: 'italic' }}>
            Tez va qulay yetkazib berish
          </p>
        </div>
      </div>

      {/* Mode toggle */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
        <button
          onClick={() => setMode('login')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === 'login' ? 'bg-white shadow text-gray-900' : 'text-gray-400'
          }`}
        >
          Kirish
        </button>
        <button
          onClick={() => setMode('register')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === 'register' ? 'bg-white shadow text-gray-900' : 'text-gray-400'
          }`}
        >
          Ro'yxatdan o'tish
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' && (
          <div className="grid grid-cols-2 gap-3">
            <Input label="Ism" name="firstName" placeholder="Isming" value={form.firstName} onChange={handleChange} error={errors.firstName} required />
            <Input label="Familiya" name="lastName" placeholder="Familiyangiz" value={form.lastName} onChange={handleChange} />
          </div>
        )}
        <Input label="Telefon raqam" name="phone" type="tel" placeholder="+998901234567"
          value={form.phone} onChange={handleChange} error={errors.phone} required />
        <Input label="PIN (4 ta raqam)" name="pin" type="password" placeholder="****"
          value={form.pin} onChange={handleChange} error={errors.pin} maxLength={4} required />
        <Button type="submit" variant="primary" fullWidth loading={loading} size="lg">
          {mode === 'login' ? 'Kirish' : "Ro'yxatdan o'tish"}
        </Button>
      </form>
    </div>
  );
}
