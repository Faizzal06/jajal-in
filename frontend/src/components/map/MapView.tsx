'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Gem } from '@/lib/types';

interface MapViewProps {
  gems: Gem[];
  onSelectGem: (gem: Gem) => void;
  userLocation?: { lat: number; lng: number } | null;
}

export default function MapView({ gems, onSelectGem, userLocation }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const userMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center: [-7.8, 110.36],
      zoom: 12,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
      userMarkerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    if (userLocation) {
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
      } else {
        const userIcon = L.divIcon({
          html: `
            <div style="position:relative;width:24px;height:24px;">
              <div style="position:absolute;width:24px;height:24px;border-radius:50%;background:rgba(68,105,0,0.3);animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
              <div style="position:absolute;top:4px;left:4px;width:16px;height:16px;border-radius:50%;background:#446900;border:3px solid white;box-shadow:0 0 8px rgba(0,0,0,0.4);"></div>
            </div>
          `,
          className: '',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });
        userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(map);
      }
      map.flyTo([userLocation.lat, userLocation.lng], 14, { animate: true });
    } else if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current);
      userMarkerRef.current = null;
    }
  }, [userLocation]);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    const defaultIcon = L.divIcon({
      html: `<div style="width:32px;height:32px;background:#a3e635;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:14px;">📍</div>`,
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    gems.forEach((gem) => {
      const marker = L.marker([gem.lat, gem.lng], { icon: defaultIcon }).addTo(map);
      marker.on('click', () => onSelectGem(gem));
      markersRef.current.push(marker);
    });
  }, [gems, onSelectGem]);

  return <div ref={mapRef} className="w-full h-full" />;
}
