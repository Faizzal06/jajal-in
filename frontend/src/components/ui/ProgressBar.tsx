interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
  showGlow?: boolean;
}

export default function ProgressBar({
  value,
  max = 100,
  className = '',
  barClassName = '',
  showGlow = false,
}: ProgressBarProps) {
  const pct = Math.min(Math.round((value / max) * 100), 100);

  return (
    <div className={`h-2 bg-[#E5E7EB] rounded-full overflow-hidden ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-500 ${barClassName || 'bg-primary-container'} ${showGlow ? 'shadow-[0_0_10px_rgba(163,230,53,0.5)]' : ''}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
