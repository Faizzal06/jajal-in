import { ReactNode } from 'react';

interface DeskProps {
  className?: string;
  padding?: boolean;
  children: ReactNode;
}

export default function Desk({ className = '', padding = true, children }: DeskProps) {
  return (
    <div className={`bg-white rounded-full border border-outline-variant ${padding ? 'p-lg' : ''} ${className}`}> 
      {children}
    </div>
  );
}
