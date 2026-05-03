export default function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className={`${sizes[size]} ${className}`}>
      <div className={`${sizes[size]} border-4 border-white/30 border-t-white rounded-full animate-spin`} />
    </div>
  );
}

export function FullPageSpinner() {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: 'linear-gradient(160deg, #E62B00 0%, #FF8C00 100%)' }}
    >
      {/* Logo bloki */}
      <div className="flex flex-col items-center gap-6">
        {/* logo-white.svg — oq kuryer */}
        <img
          src="/icons/logo-white.svg"
          alt="Parkent Express"
          className="w-48 h-48 object-contain drop-shadow-2xl"
        />

        {/* PARKENT EXPRESS matn */}
        <div className="flex flex-col items-center gap-0.5">
          <span
            className="text-white font-black tracking-widest leading-tight"
            style={{ fontSize: '2.4rem', letterSpacing: '0.08em', textShadow: '0 2px 16px rgba(0,0,0,0.25)' }}
          >
            PARKENT
          </span>
          <span
            className="text-white font-black tracking-widest leading-tight"
            style={{ fontSize: '2.4rem', letterSpacing: '0.08em', textShadow: '0 2px 16px rgba(0,0,0,0.25)' }}
          >
            EXPRESS
          </span>
        </div>

        {/* Slogan */}
        <p
          className="text-white/80 font-medium tracking-wider"
          style={{ fontStyle: 'italic', fontSize: '0.88rem', letterSpacing: '0.06em' }}
        >
          Taom yetkazib berish xizmati
        </p>
      </div>

      {/* Loading dots */}
      <div className="absolute bottom-14 flex items-center gap-2.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2.5 h-2.5 rounded-full bg-white/60 inline-block"
            style={{ animation: `pe-bounce 1.2s ease-in-out ${i * 0.22}s infinite` }}
          />
        ))}
      </div>
    </div>
  );
}
