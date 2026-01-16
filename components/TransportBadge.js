import { Train, Bus, Car, Navigation } from 'lucide-react';

const TransportBadge = ({ mode }) => {
  const modes = mode.split('+');
  return (
    <div className="flex gap-1 flex-wrap">
      {modes.map((m, i) => {
        const configs = {
          mrt: { icon: Train, bg: 'bg-purple-100', text: 'text-purple-700', label: 'MRT' },
          bus: { icon: Bus, bg: 'bg-blue-100', text: 'text-blue-700', label: 'Bus' },
          car: { icon: Car, bg: 'bg-green-100', text: 'text-green-700', label: 'Car' },
          walk: { icon: Navigation, bg: 'bg-gray-100', text: 'text-gray-700', label: 'Walk' },
          none: { icon: null, bg: '', text: '', label: '' }
        };
        const config = configs[m] || configs.walk;
        if (!config.icon) return null;
        const Icon = config.icon;
        return (
          <span key={i} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
            <Icon size={12} />
            {config.label}
          </span>
        );
      })}
    </div>
  );
};

export default TransportBadge;
