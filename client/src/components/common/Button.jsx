import { ArrowRight } from 'lucide-react';

export default function Button({ children, secondary, onClick, type = 'button', className = '', disabled = false }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn ${secondary ? 'secondary' : ''} ${className}`}
    >
      {children}
      <ArrowRight size={18} />
    </button>
  );
}