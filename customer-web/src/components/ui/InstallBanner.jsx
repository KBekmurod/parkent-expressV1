'use client';
import { useState, useEffect } from 'react';
import { Download, X, Share } from 'lucide-react';

export default function InstallBanner() {
  const [show, setShow] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Allaqachon standalone (o'rnatilgan) rejimda ishlayaptimi?
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    if (isStandalone) return;

    // Avval yopilganmi?
    if (sessionStorage.getItem('pwa_dismissed')) return;

    const ua = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(ua);
    const android = /android/.test(ua);
    setIsIOS(ios);
    setIsAndroid(android);

    if (android) {
      // Android: beforeinstallprompt ni kutamiz
      const handler = (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setTimeout(() => setShow(true), 3000);
      };
      window.addEventListener('beforeinstallprompt', handler);
      // Agar 5 sekunddan keyin event kelmasa ham ko'rsatamiz
      const fallback = setTimeout(() => setShow(true), 5000);
      return () => {
        window.removeEventListener('beforeinstallprompt', handler);
        clearTimeout(fallback);
      };
    } else if (ios) {
      // iOS: har doim ko'rsatamiz (Safari'da Share -> Add to Home Screen)
      setTimeout(() => setShow(true), 3000);
    } else {
      // Desktop yoki boshqa
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
    <div className="fixed bottom-20 left-3 right-3 z-50 bg-white rounded-2xl shadow-2xl border border-orange-100 p-4"
      style={{ animation: 'slideUp 0.3s ease-out' }}>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(80px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      <div className="flex items-start gap-3">
        {/* Logo */}
        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
          <img src="/web/icons/icon-192.png" alt="Parkent Express" className="w-full h-full object-cover" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-sm">Parkent Express ilovasini yuklab oling</p>
          <p className="text-xs text-gray-500 mt-0.5">Tezroq ishlaydi, offline ham ko'rish mumkin</p>

          {isIOS ? (
            <div className="mt-2 bg-orange-50 rounded-xl p-2.5 text-xs text-orange-800">
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
              className="mt-2 flex items-center gap-1.5 bg-orange-500 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-orange-600 active:scale-95 transition-all"
            >
              <Download size={13} />
              Yuklab olish (bepul)
            </button>
          )}
        </div>

        <button onClick={handleDismiss}
          className="text-gray-300 hover:text-gray-500 flex-shrink-0 p-1">
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
