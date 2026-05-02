export default function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className={`${sizes[size]} ${className}`}>
      <div className={`${sizes[size]} border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin`} />
    </div>
  );
}

/* ─── Logotip SVG kuryer (oq, logotipga mos) ─────────────────────────────── */
function LogoCourier({ className = '' }) {
  return (
    <svg viewBox="0 0 512 512" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Speed lines */}
      <path d="M48 220 L155 220" stroke="rgba(255,255,255,0.75)" strokeWidth="18" strokeLinecap="round"/>
      <path d="M60 252 L148 252" stroke="rgba(255,255,255,0.50)" strokeWidth="13" strokeLinecap="round"/>
      <path d="M75 282 L145 282" stroke="rgba(255,255,255,0.30)" strokeWidth="9"  strokeLinecap="round"/>
      {/* Head */}
      <circle cx="315" cy="118" r="35" fill="white"/>
      <ellipse cx="315" cy="112" rx="38" ry="12" fill="rgba(255,255,255,0.5)"/>
      {/* Body */}
      <path d="M297 155 Q292 200 278 245 Q270 268 262 290"
            stroke="white" strokeWidth="30" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Right arm */}
      <path d="M307 178 Q350 160 375 150" stroke="white" strokeWidth="24" strokeLinecap="round"/>
      {/* Left arm */}
      <path d="M292 180 Q255 200 238 222" stroke="white" strokeWidth="20" strokeLinecap="round"/>
      {/* Box */}
      <rect x="363" y="118" width="76" height="62" rx="10" fill="white"/>
      <line x1="363" y1="145" x2="439" y2="145" stroke="rgba(200,60,0,0.35)" strokeWidth="4"/>
      <line x1="401" y1="118" x2="401" y2="180" stroke="rgba(200,60,0,0.35)" strokeWidth="4"/>
      {/* Steam */}
      <path d="M388 112 Q392 100 388 90" stroke="rgba(255,255,255,0.75)" strokeWidth="6" fill="none" strokeLinecap="round"/>
      <path d="M407 108 Q411 95 407 84" stroke="rgba(255,255,255,0.50)" strokeWidth="5" fill="none" strokeLinecap="round"/>
      {/* Front leg */}
      <path d="M268 288 Q262 335 257 375 Q253 398 247 416"
            stroke="white" strokeWidth="26" strokeLinecap="round"/>
      {/* Back leg */}
      <path d="M273 286 Q290 325 306 355 Q316 376 318 398"
            stroke="white" strokeWidth="24" strokeLinecap="round"/>
      {/* Front foot */}
      <path d="M243 412 Q231 428 217 430 Q203 432 200 422"
            stroke="white" strokeWidth="20" strokeLinecap="round"/>
      {/* Back foot */}
      <path d="M316 396 Q332 408 345 406 Q358 404 358 394"
            stroke="white" strokeWidth="20" strokeLinecap="round"/>
    </svg>
  );
}

/* ─── SPLASH SCREEN ──────────────────────────────────────────────────────── */
export function FullPageSpinner() {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: 'linear-gradient(145deg, #FF6B00 0%, #CC2200 100%)' }}
    >
      {/* Logotip bloki — markazda */}
      <div className="flex flex-col items-center gap-5">
        {/* Mini icon */}
        <div
          className="w-28 h-28 rounded-3xl flex items-center justify-center"
          style={{
            background: 'rgba(255,255,255,0.15)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.20)',
          }}
        >
          <LogoCourier className="w-20 h-20" />
        </div>

        {/* PARKENT EXPRESS — logotip shriftiga yaqin */}
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

        {/* Slogan — logotipga mos, italic */}
        <p
          className="text-white/80 font-semibold mt-1 tracking-wide"
          style={{ fontStyle: 'italic', fontSize: '0.9rem', letterSpacing: '0.05em' }}
        >
          Ovqat yetkazib berish xizmati
        </p>
      </div>

      {/* Loading dots — pastda */}
      <div className="absolute bottom-16 flex flex-col items-center gap-3">
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-white/60 inline-block"
              style={{ animation: `pe_bounce 1.2s ease-in-out ${i * 0.22}s infinite` }}
            />
          ))}
        </div>
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
