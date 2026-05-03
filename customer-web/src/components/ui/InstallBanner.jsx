'use client';
import { useState, useEffect } from 'react';
import { Download, X, Share } from 'lucide-react';

export default function InstallBanner() {
  const [show, setShow] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    if (isStandalone) return;
    if (sessionStorage.getItem('pwa_dismissed')) return;

    const ua = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(ua);
    const android = /android/.test(ua);
    setIsIOS(ios);

    if (android) {
      const handler = (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setTimeout(() => setShow(true), 3000);
      };
      window.addEventListener('beforeinstallprompt', handler);
      const fallback = setTimeout(() => setShow(true), 5000);
      return () => {
        window.removeEventListener('beforeinstallprompt', handler);
        clearTimeout(fallback);
      };
    } else if (ios) {
      setTimeout(() => setShow(true), 3000);
    } else {
      const handler = (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setTimeout(() => setShow(true), 3000);
      };
      window.addEventListener('beforeinstallprompt', handler);
    }
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      if (outcome === 'accepted') setShow(false);
    }
  };

  const handleDismiss = () => {
    setShow(false);
    sessionStorage.setItem('pwa_dismissed', '1');
  };

  if (!show) return null;

  return (
    <div
      className="fixed bottom-20 left-3 right-3 z-50 bg-white rounded-2xl p-4"
      style={{
        border: '1px solid rgba(230,43,0,0.12)',
        boxShadow: '0 8px 32px rgba(230,43,0,0.14), 0 2px 8px rgba(0,0,0,0.07)',
        animation: 'slide-up 0.35s cubic-bezier(0.34,1.56,0.64,1)',
      }}
    >
      <div className="flex items-start gap-3">

        {/* Icon — gradient fon + PWA icon */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #E62B00 0%, #FF8C00 100%)',
            boxShadow: '0 4px 12px rgba(230,43,0,0.35)',
          }}
        >
          <img
            src="/icons/icon-192.png"
            alt="Parkent Express"
            className="w-10 h-10 object-contain"
          />
        </div>

        {/* Matn + tugma */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm leading-tight" style={{ color: '#0C1E3E' }}>
            Parkent Express ilovasini yuklab oling
          </p>
          <p className="text-xs mt-0.5 leading-snug" style={{ color: '#A0AEC0' }}>
            Tezroq ishlaydi · Offline ham ko'rish mumkin
          </p>

          {isIOS ? (
            <div
              className="mt-2.5 rounded-xl p-2.5 text-xs border"
              style={{ background: '#fff3ed', borderColor: 'rgba(230,43,0,0.15)', color: '#7c2d12' }}
            >
              <p className="font-semibold mb-1 flex items-center gap-1">
                <Share size={11} /> Safari orqali qo'shing:
              </p>
              <p>1. Pastdagi <strong>↑ Ulashish</strong> tugmasini bosing</p>
              <p>2. <strong>"Bosh ekranga qo'shish"</strong> ni tanlang</p>
              <p>3. <strong>Qo'shish</strong> ni bosing ✅</p>
            </div>
          ) : (
            <button
              onClick={handleInstall}
              className="mt-2.5 flex items-center gap-1.5 text-white text-xs font-bold px-4 py-2 rounded-xl active:scale-95 transition-all"
              style={{
                background: 'linear-gradient(135deg, #E62B00 0%, #FF8C00 100%)',
                boxShadow: '0 3px 10px rgba(230,43,0,0.35)',
                borderRadius: '12px',
              }}
            >
              <Download size={13} />
              Yuklab olish (bepul)
            </button>
          )}
        </div>

        {/* Yopish */}
        <button
          onClick={handleDismiss}
          className="text-gray-300 hover:text-gray-400 flex-shrink-0 p-1 transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
