export default function PageWrapper({ children, className = '' }) {
  return (
    <div className={`max-w-2xl mx-auto px-4 py-4 pb-20 ${className}`}>
      {children}
    </div>
  );
}
