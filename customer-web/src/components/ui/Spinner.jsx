export default function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className={`${sizes[size]} ${className}`}>
      <div className={`${sizes[size]} border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin`} />
    </div>
  );
}

/* ─── SPLASH SCREEN — faqat PNG logo ─────────────────────────────────────── */
export function FullPageSpinner() {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: 'linear-gradient(145deg, #FF6B00 0%, #CC2200 100%)' }}
    >
      {/* Logotip bloki — markazda */}
      <div className="flex flex-col items-center gap-5">

        {/* PNG logo — oq doira fonda */}
        <div
          className="w-36 h-36 rounded-3xl flex items-center justify-center"
          style={{
            background: 'rgba(255,255,255,0.15)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.20)',
          }}
        >
          <img
            src="/icons/icon-192.png"
            alt="Parkent Express"
            className="w-28 h-28 object-contain"
          />
        </div>

        {/* PARKENT EXPRESS matn */}
        <div className="flex flex-col items-center gap-0">
          <span
            className="text-white font-black tracking-widest leading-tight"
            style={{ fontSize: '2.5rem', letterSpacing: '0.07em', textShadow: '0 2px 12px rgba(0,0,0,0.20)' }}
          >
            PARKENT
          </span>
          <span
            className="text-white font-black tracking-widest leading-tight"
            style={{ fontSize: '2.5rem', letterSpacing: '0.07em', textShadow: '0 2px 12px rgba(0,0,0,0.20)' }}
          >
            EXPRESS
          </span>
        </div>

        {/* Slogan — italic */}
        <p
          className="text-white/80 font-semibold mt-1 tracking-wide"
          style={{ fontStyle: 'italic', fontSize: '0.9rem', letterSpacing: '0.05em' }}
        >
          Ovqat yetkazib berish xizmati
        </p>
      </div>

      {/* Loading dots — pastda */}
      <div className="absolute bottom-16 flex items-center gap-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2.5 h-2.5 rounded-full bg-white/60 inline-block"
            style={{ animation: `pe_bounce 1.2s ease-in-out ${i * 0.22}s infinite` }}
          />
        ))}
        <style>{`
          @keyframes pe_bounce {
            0%, 80%, 100% { transform: scale(0.65); opacity: 0.45; }
            40%            { transform: scale(1.25); opacity: 1;    }
          }
        `}</style>
      </div>
    </div>
  );
}
