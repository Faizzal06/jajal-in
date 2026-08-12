'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Icon from '@/components/ui/Icon';

export interface LocationPickerProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
  height?: string;
  className?: string;
}

interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

export default function LocationPicker({
  lat,
  lng,
  onChange,
  height = 'h-64 sm:h-80',
  className = '',
}: LocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle Marker Position Changes
  const updatePosition = useCallback(
    (newLat: number, newLng: number, fly = false) => {
      const precisionLat = Number(newLat.toFixed(6));
      const precisionLng = Number(newLng.toFixed(6));

      onChange(precisionLat, precisionLng);

      if (markerRef.current) {
        markerRef.current.setLatLng([precisionLat, precisionLng]);
      }

      if (fly && mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([precisionLat, precisionLng], 15, { animate: true });
      }
    },
    [onChange]
  );

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialLat = lat || -6.8898;
    const initialLng = lng || 109.6753;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 13,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Pin Icon Vivid Explorer
    const pinIcon = L.divIcon({
      html: `
        <div style="position:relative;width:36px;height:36px;display:flex;align-items:center;justify-content:center;">
          <div style="position:absolute;width:36px;height:36px;border-radius:50%;background:rgba(68,105,0,0.25);animation:ping 2s cubic-bezier(0,0,0.2,1) infinite;"></div>
          <div style="width:32px;height:32px;background:#a3e635;border:3px solid #191d12;border-radius:50%;box-shadow:0 4px 12px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:bold;color:#191d12;">📍</div>
        </div>
      `,
      className: '',
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    const marker = L.marker([initialLat, initialLng], {
      icon: pinIcon,
      draggable: true,
    }).addTo(map);

    // Marker Drag Handler
    marker.on('dragend', () => {
      const position = marker.getLatLng();
      updatePosition(position.lat, position.lng);
    });

    // Map Click Handler
    map.on('click', (e: L.LeafletMouseEvent) => {
      updatePosition(e.latlng.lat, e.latlng.lng);
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  // Synchronize map & marker if props change externally
  useEffect(() => {
    if (!markerRef.current || !mapInstanceRef.current) return;
    const currentPos = markerRef.current.getLatLng();
    if (Math.abs(currentPos.lat - lat) > 0.00001 || Math.abs(currentPos.lng - lng) > 0.00001) {
      markerRef.current.setLatLng([lat, lng]);
      mapInstanceRef.current.panTo([lat, lng]);
    }
  }, [lat, lng]);

  // Geocoding Nominatim Search
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setErrorMsg('');
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=5`
      );
      const data: SearchResult[] = await res.json();
      setSearchResults(data);
      setShowDropdown(true);
      if (data.length === 0) {
        setErrorMsg('Lokasi tidak ditemukan. Coba kata kunci lain.');
      }
    } catch {
      setErrorMsg('Gagal mencari lokasi. Periksa koneksi internet Anda.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectResult = (result: SearchResult) => {
    const newLat = parseFloat(result.lat);
    const newLng = parseFloat(result.lon);
    updatePosition(newLat, newLng, true);
    setSearchQuery(result.display_name);
    setShowDropdown(false);
  };

  // Detect GPS Position
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation tidak didukung oleh browser ini.');
      return;
    }

    setIsLocating(true);
    setErrorMsg('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        updatePosition(pos.coords.latitude, pos.coords.longitude, true);
      },
      (err) => {
        setIsLocating(false);
        setErrorMsg(`Gagal mengambil lokasi GPS: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Search Bar & GPS Button */}
      <div className="relative">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (!e.target.value) setShowDropdown(false);
              }}
              placeholder="Cari tempat / nama jalan (misal: Ubud, Bali)..."
              className="w-full bg-white border border-outline-variant rounded-xl pl-10 pr-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-2 focus:border-slate-heavy transition-all"
            />
            <Icon
              name="search"
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-4 py-2.5 bg-primary-container text-on-surface font-semibold text-sm rounded-xl hover:opacity-90 active:scale-95 transition-all shrink-0 flex items-center gap-1.5"
          >
            {isSearching ? (
              <span className="animate-spin text-xs">⏳</span>
            ) : (
              <Icon name="search" size={18} />
            )}
            <span className="hidden sm:inline">Cari</span>
          </button>
          <button
            type="button"
            onClick={handleDetectGPS}
            disabled={isLocating}
            title="Gunakan Lokasi GPS Saya"
            className="px-3 py-2.5 bg-white border border-outline-variant text-primary font-semibold text-sm rounded-xl hover:bg-surface-dim/40 active:scale-95 transition-all shrink-0 flex items-center gap-1.5"
          >
            <Icon name="my_location" size={18} className={isLocating ? 'animate-spin' : ''} />
            <span className="hidden md:inline">{isLocating ? 'Mencari...' : 'GPS'}</span>
          </button>
        </form>

        {/* Nominatim Search Dropdown Results */}
        {showDropdown && searchResults.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-outline-variant rounded-xl shadow-lg z-50 overflow-hidden divide-y divide-outline-variant/30 max-h-60 overflow-y-auto">
            {searchResults.map((res) => (
              <button
                key={res.place_id}
                type="button"
                onClick={() => handleSelectResult(res)}
                className="w-full text-left px-4 py-3 hover:bg-surface-dim/30 transition-colors flex items-start gap-2.5"
              >
                <Icon name="location_on" size={18} className="text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-on-surface leading-snug line-clamp-2">
                    {res.display_name}
                  </p>
                  <p className="text-[10px] text-on-surface-variant mt-0.5 font-mono">
                    {Number(res.lat).toFixed(4)}, {Number(res.lon).toFixed(4)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="text-xs font-medium text-error bg-error/10 border border-error/30 rounded-lg px-3 py-2 flex items-center gap-1.5">
          <Icon name="error" size={16} />
          {errorMsg}
        </div>
      )}

      {/* Map Container */}
      <div className={`relative rounded-2xl overflow-hidden border border-outline-variant ${height}`}>
        <div ref={mapContainerRef} className="w-full h-full z-0" />
        <div className="absolute bottom-2 left-2 z-10 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-outline-variant text-[11px] font-mono text-on-surface shadow-sm">
          💡 Klik peta / geser pin untuk atur posisi
        </div>
      </div>

      {/* Synchronized Manual Input Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div>
          <label className="text-xs font-medium text-on-surface-variant mb-1 block flex items-center justify-between">
            <span>Latitude</span>
            <span className="text-[10px] text-on-surface-variant/70">Desimal (misal: -8.5069)</span>
          </label>
          <input
            type="number"
            step="any"
            value={lat || ''}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (!isNaN(val)) updatePosition(val, lng, true);
            }}
            placeholder="-8.5069"
            className="w-full bg-white border border-outline-variant rounded-xl px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-slate-heavy"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-on-surface-variant mb-1 block flex items-center justify-between">
            <span>Longitude</span>
            <span className="text-[10px] text-on-surface-variant/70">Desimal (misal: 115.2625)</span>
          </label>
          <input
            type="number"
            step="any"
            value={lng || ''}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (!isNaN(val)) updatePosition(lat, val, true);
            }}
            placeholder="115.2625"
            className="w-full bg-white border border-outline-variant rounded-xl px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-slate-heavy"
          />
        </div>
      </div>
    </div>
  );
}
