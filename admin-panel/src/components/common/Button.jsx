const Button = ({ children, variant = 'primary', type = 'button', onClick, disabled, className = '' }) => {
  const baseClasses = 'px-4 py-2 rounded-lg transition-colors font-medium'
  
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 disabled:bg-primary-300',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-100',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300',
    success: 'bg-green-600 text-white hover:bg-green-700 disabled:bg-green-300',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

export default Button
