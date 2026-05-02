'use client';
import { useState, useEffect } from 'react';
import { Download, X, Share } from 'lucide-react';

/* ─── Simplified Icon (logotipga mos) ────────────────────────────────────── */
function SimplifiedIcon({ className = '' }) {
  return (
    <div
      className={`rounded-2xl flex items-center justify-center flex-shrink-0 ${className}`}
      style={{
        background: 'linear-gradient(135deg, #FF6B00 0%, #CC2200 100%)',
        boxShadow: '0 4px 14px rgba(200,34,0,0.38)',
      }}
    >
      <svg viewBox="0 0 512 512" className="w-3/4 h-3/4" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M48 220 L155 220" stroke="rgba(255,255,255,0.75)" strokeWidth="22" strokeLinecap="round"/>
        <path d="M60 252 L148 252" stroke="rgba(255,255,255,0.50)" strokeWidth="16" strokeLinecap="round"/>
        <path d="M75 282 L145 282" stroke="rgba(255,255,255,0.28)" strokeWidth="11"  strokeLinecap="round"/>
        <circle cx="315" cy="118" r="35" fill="white"/>
        <ellipse cx="315" cy="112" rx="38" ry="12" fill="rgba(255,255,255,0.45)"/>
        <path d="M297 155 Q292 200 278 245 Q270 268 262 290"
              stroke="white" strokeWidth="30" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M307 178 Q350 160 375 150" stroke="white" strokeWidth="24" strokeLinecap="round"/>
        <path d="M292 180 Q255 200 238 222" stroke="white" strokeWidth="20" strokeLinecap="round"/>
        <rect x="363" y="118" width="76" height="62" rx="10" fill="white"/>
        <line x1="363" y1="145" x2="439" y2="145" stroke="rgba(200,60,0,0.3)" strokeWidth="4"/>
        <line x1="401" y1="118" x2="401" y2="180" stroke="rgba(200,60,0,0.3)" strokeWidth="4"/>
        <path d="M388 112 Q392 100 388 90" stroke="rgba(255,255,255,0.7)" strokeWidth="6" fill="none" strokeLinecap="round"/>
        <path d="M407 108 Q411 95 407 84" stroke="rgba(255,255,255,0.5)" strokeWidth="5" fill="none" strokeLinecap="round"/>
        <path d="M268 288 Q262 335 257 375 Q253 398 247 416"
              stroke="white" strokeWidth="26" strokeLinecap="round"/>
        <path d="M273 286 Q290 325 306 355 Q316 376 318 398"
              stroke="white" strokeWidth="24" strokeLinecap="round"/>
        <path d="M243 412 Q231 428 217 430 Q203 432 200 422"
              stroke="white" strokeWidth="20" strokeLinecap="round"/>
        <path d="M316 396 Q332 408 345 406 Q358 404 358 394"
              stroke="white" strokeWidth="20" strokeLinecap="round"/>
      </svg>
    </div>
  );
}

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
      className="fixed bottom-20 left-3 right-3 z-50 bg-white rounded-2xl border border-orange-100 p-4"
      style={{
        boxShadow: '0 8px 32px rgba(200,34,0,0.16), 0 2px 8px rgba(0,0,0,0.08)',
        animation: 'pe_slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)',
      }}
    >
      <style>{`
        @keyframes pe_slideUp {
          from { transform: translateY(90px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>

      <div className="flex items-start gap-3">
        {/* Simplified Icon */}
        <SimplifiedIcon className="w-14 h-14" />

        {/* Matn + tugma */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-sm leading-tight">
            Parkent Express ilovasini yuklab oling
          </p>
          <p className="text-xs text-gray-500 mt-0.5 leading-snug">
            Tezroq ishlaydi · Offline ham ko'rish mumkin
          </p>

          {isIOS ? (
            <div className="mt-2.5 bg-orange-50 rounded-xl p-2.5 text-xs text-orange-900 border border-orange-100">
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
                background: 'linear-gradient(135deg, #FF6B00 0%, #CC2200 100%)',
                boxShadow: '0 3px 10px rgba(200,34,0,0.38)',
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
          className="text-gray-300 hover:text-gray-500 flex-shrink-0 p-1 transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
