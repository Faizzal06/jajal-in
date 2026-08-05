interface MapStaticProps {
  lat: number;
  lng: number;
  label?: string;
  height?: string;
  className?: string;
}

export default function MapStatic({
  lat,
  lng,
  label,
  height = 'h-48',
  className = '',
}: MapStaticProps) {
  const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

  return (
    <div className={`relative rounded-xl overflow-hidden ${height} ${className}`}>
      <div className="absolute inset-0 bg-[#e8e8e0] flex flex-col items-center justify-center">
        <div className="text-4xl mb-2">🗺️</div>
        <p className="text-sm text-on-surface-variant">
          {lat.toFixed(4)}, {lng.toFixed(4)}
        </p>
        {label && <p className="text-xs text-on-surface-variant mt-1">{label}</p>}
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 text-sm text-primary underline hover:text-primary-container"
        >
          Buka di Google Maps
        </a>
      </div>
    </div>
  );
}
