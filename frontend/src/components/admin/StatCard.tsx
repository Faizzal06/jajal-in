import Icon from '../ui/Icon';

interface StatCardProps {
  label: string;
  value: number;
  icon: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'primary' | 'secondary' | 'error' | 'tertiary';
}

const colorMap = {
  primary: 'bg-primary-container/30 text-primary',
  secondary: 'bg-secondary-container/30 text-secondary',
  error: 'bg-error-container/30 text-error',
  tertiary: 'bg-tertiary-container/30 text-tertiary',
};

export default function StatCard({ label, value, icon, color = 'primary' }: StatCardProps) {
  return (
    <div className="bg-white rounded-[22px] border border-light-gray p-6 flex items-start justify-between">
      <div>
        <p className="text-sm text-on-surface-variant font-medium">{label}</p>
        <p className="text-3xl font-headline font-bold text-slate-heavy mt-1">{value.toLocaleString('id-ID')}</p>
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
        <Icon name={icon} size={24} />
      </div>
    </div>
  );
}
