import { ReactNode } from 'react';

interface CardProps {
  className?: string;
  padding?: boolean;
  children: ReactNode;
}

export default function Card({ className = '', padding = true, children }: CardProps) {
  return (
    <div className={`bg-white rounded-full border border-outline-variant ${padding ? 'p-lg' : ''} ${className}`}>
      {children}
    </div>
  );
}
