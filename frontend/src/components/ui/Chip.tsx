import { ButtonHTMLAttributes } from 'react';

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export default function Chip({ active = false, className = '', children, ...props }: ChipProps) {
  return (
    <button
      className={`rounded-full px-5 py-2 whitespace-nowrap text-sm font-medium transition-colors duration-150 ${
        active
          ? 'bg-slate-heavy text-white'
          : 'bg-[#E5E7EB] text-slate-heavy hover:bg-[#d1d5db]'
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
