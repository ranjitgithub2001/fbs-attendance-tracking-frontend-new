export function Button({ label, onClick, variant = 'primary', loading = false, disabled = false, type = 'button' }) {
  const base = 'rounded-lg px-4 py-2 text-sm font-medium inline-flex items-center justify-center gap-2';
  const variants = {
    primary: 'bg-[#84cc16] hover:bg-[#65a30d] text-black',
    secondary: 'border border-[#3a3a3a] text-white hover:bg-fbs-card',
    danger: 'bg-red-700 hover:bg-red-800 text-white',
  };

  return (
    <button type={type} onClick={onClick} disabled={disabled || loading} className={`${base} ${variants[variant]}`}>
      {loading && (
        <svg className="h-4 w-4 animate-spin text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
      )}
      <span>{label}</span>
    </button>
  );
}

export default Button;
