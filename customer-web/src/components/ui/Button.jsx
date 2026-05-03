import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  onClick,
  className = '',
}) {
  const base = 'inline-flex items-center justify-center font-semibold transition-all focus:outline-none active:scale-[0.97]';

  const variants = {
    primary: 'text-white',
    secondary: 'bg-white text-navy border border-navy hover:bg-surface',
    outline: 'bg-transparent border text-primary-500 hover:bg-primary-50',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    ghost: 'text-content-body hover:bg-gray-100',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3.5 text-base',
  };

  const primaryStyle = variant === 'primary' ? {
    background: 'linear-gradient(135deg, #E62B00 0%, #FF8C00 100%)',
    borderRadius: '12px',
    boxShadow: '0 4px 14px rgba(230,43,0,0.32)',
  } : {
    borderRadius: '12px',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={primaryStyle}
      className={`
        ${base}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled || loading ? 'opacity-60 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
}
