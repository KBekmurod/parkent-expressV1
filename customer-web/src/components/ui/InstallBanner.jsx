'use client';
import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export default function InstallBanner() {
  const [show, setShow] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Allaqachon o'rnatilganmi?
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    if (localStorage.getItem('pwa_dismissed')) return;

    const ios = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    setIsIOS(ios);

    if (ios) {
      // iOS'da 2 soniyadan keyin ko'rsatish
      setTimeout(() => setShow(true), 2000);
    } else {
      // Android/Desktop - beforeinstallprompt hodisasini kutish
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setTimeout(() => setShow(true), 2000);
      });
    }
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShow(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('pwa_dismissed', '1');
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 bg-white rounded-2xl shadow-xl border border-orange-100 p-4 animate-slide-up">
      <div className="flex items-start gap-3">
        {/* Logo */}
        <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-lg">PE</span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-sm">Parkent Express</p>
          <p className="text-xs text-gray-500 mt-0.5">Ilovani ekranga qo'shing — tezroq ishlaydi!</p>

          {isIOS ? (
            <div className="mt-2 text-xs text-gray-600 bg-gray-50 rounded-lg p-2">
              <p className="font-medium mb-1">iOS'da o'rnatish:</p>
              <p>1. Pastdagi <strong>↑ Share</strong> tugmasini bosing</p>
              <p>2. <strong>"Add to Home Screen"</strong> ni tanlang</p>
            </div>
          ) : (
            <button
              onClick={handleInstall}
              className="mt-2 flex items-center gap-1.5 bg-orange-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-orange-600 active:bg-orange-700"
            >
              <Download size={12} />
              Yuklab olish
            </button>
          )}
        </div>

        <button onClick={handleDismiss} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
