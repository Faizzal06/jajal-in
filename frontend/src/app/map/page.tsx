'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Chip from '@/components/ui/Chip';
import Icon from '@/components/ui/Icon';
import Card from '@/components/ui/Card';
import PlaceImage from '@/components/ui/PlaceImage';
import PageShell from '@/components/layout/PageShell';
import Loading from '@/app/loading';
import { gems as mockGems } from '@/lib/mock/gems';
import { exploreApi } from '@/lib/api-client';
import { Gem } from '@/lib/types';

const MapView = dynamic(() => import('@/components/map/MapView'), { ssr: false });

const categories = ['All Gems', 'Local Eats', 'Photo Spots', 'Culture', 'Nature'];

const PEKALONGAN_LAT = -6.8898;
const PEKALONGAN_LNG = 109.6753;
const DEFAULT_RADIUS = 10000;

export default function MapPage() {
  const router = useRouter();
  const [pageReady, setPageReady] = useState(false);
  const [activeChip, setActiveChip] = useState(0);
  const [selectedGem, setSelectedGem] = useState<Gem | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [mapGems, setMapGems] = useState<Gem[]>(mockGems);
  const [, setMapLoading] = useState(true);

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showPermissionModal, setShowPermissionModal] = useState<boolean>(false);
  const [gpsDenied, setGpsDenied] = useState<boolean>(false);

  useEffect(() => {
    setShowMap(true);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setPageReady(true), 1000);
    return () => clearTimeout(t);
  }, []);

  const fetchMapData = useCallback(async (lat: number, lng: number) => {
    setMapLoading(true);
    try {
      const data = await exploreApi.getMap(lat, lng, DEFAULT_RADIUS);
      if (data && data.length > 0) {
        const transformed: Gem[] = data.map((p) => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          region: { id: '', name: p.region_name ?? '', slug: '' },
          category: { id: '', name: p.category_name ?? '', slug: '', applicableTo: 'both' as const, icon: p.category_icon ?? 'place' },
          description: p.description ?? '',
          lat: p.lat,
          lng: p.lng,
          rating: p.rating ?? 0,
          reviewCount: p.review_count ?? 0,
          status: 'approved' as const,
          isSponsored: p.is_sponsored ?? false,
          media: p.place_media?.[0]?.url ? [{ id: '', url: p.place_media[0].url, mediaType: 'image' }] : [],
          tags: [],
        }));
        setMapGems(transformed);
      }
    } catch {
      // fallback to mock data already set
    } finally {
      setMapLoading(false);
    }
  }, []);

  const requestGpsLocation = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(coords);
          setShowPermissionModal(false);
          setGpsDenied(false);
          fetchMapData(coords.lat, coords.lng);
        },
        (err) => {
          console.warn('GPS position error:', err.message);
          setGpsDenied(true);
          setShowPermissionModal(false);
          fetchMapData(PEKALONGAN_LAT, PEKALONGAN_LNG);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setGpsDenied(true);
      setShowPermissionModal(false);
      fetchMapData(PEKALONGAN_LAT, PEKALONGAN_LNG);
    }
  }, [fetchMapData]);

  const handleUseDefaultLocation = useCallback(() => {
    setShowPermissionModal(false);
    fetchMapData(PEKALONGAN_LAT, PEKALONGAN_LNG);
  }, [fetchMapData]);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' as PermissionName }).then((result) => {
        if (result.state === 'granted') {
          requestGpsLocation();
        } else if (result.state === 'prompt') {
          setShowPermissionModal(true);
          fetchMapData(PEKALONGAN_LAT, PEKALONGAN_LNG);
        } else {
          // denied
          setGpsDenied(true);
          setShowPermissionModal(false);
          fetchMapData(PEKALONGAN_LAT, PEKALONGAN_LNG);
        }
      }).catch(() => {
        setShowPermissionModal(true);
        fetchMapData(PEKALONGAN_LAT, PEKALONGAN_LNG);
      });
    } else {
      setShowPermissionModal(true);
      fetchMapData(PEKALONGAN_LAT, PEKALONGAN_LNG);
    }
  }, [fetchMapData, requestGpsLocation]);

  if (!pageReady) {
    return (
      <PageShell title="Jajal.in">
        <Loading />
      </PageShell>
    );
  }

  return (
    <PageShell title="Jajal.in" maxWidth="max-w-none">
      <div className="fixed inset-0 top-16 bottom-16 z-0">
        {/* Map */}
        <div className="h-full w-full bg-surface-dim">
          {showMap && <MapView gems={mapGems} onSelectGem={setSelectedGem} userLocation={userLocation} />}
        </div>
      </div>

      {/* Floating Elements (Search, Chips, Banner) */}
      <div className="relative z-10 pointer-events-none">
        {/* Search & Filters */}
        <div className="absolute top-4 left-4 right-4 space-y-3 pointer-events-auto">
          <div className="glass-panel rounded-full px-4 h-12 flex items-center gap-3 shadow-sm bg-white/80 backdrop-blur-md border border-outline-variant">
            <Icon name="search" size={20} className="text-on-surface-variant shrink-0" />
            <input
              type="text"
              placeholder="Cari tempat..."
              className="flex-1 bg-transparent text-base text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none"
            />
            <Icon name="tune" size={20} className="text-on-surface-variant shrink-0" />
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {categories.map((cat, i) => (
              <Chip key={cat} active={i === activeChip} onClick={() => setActiveChip(i)}>
                {cat}
              </Chip>
            ))}
          </div>
        </div>

        {/* GPS Denied Banner */}
        {gpsDenied && !showPermissionModal && (
          <div className="absolute top-24 left-4 right-4 bg-surface-dim/90 border border-outline-variant text-on-surface text-xs p-2.5 rounded-xl shadow flex items-center justify-between pointer-events-auto">
            <span>📍 Lokasi default: Pekalongan. Aktifkan GPS di browser untuk menemukan tempat di dekat Anda.</span>
            <button onClick={requestGpsLocation} className="text-primary font-bold ml-2 underline shrink-0">Coba lagi</button>
          </div>
        )}
      </div>

      {/* Overlays (Card, FABs) */}
      <div className="fixed bottom-20 left-0 right-0 px-4 pointer-events-none z-10">
        <div className="max-w-7xl mx-auto relative h-full">
          {/* Peek Card */}
          {selectedGem && (
            <div className="animate-slide-up pointer-events-auto mb-4">
              <Card className="flex items-center gap-4 shadow-lg relative bg-white/95 backdrop-blur-sm">
                <button
                  onClick={() => setSelectedGem(null)}
                  className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-surface-dim border border-outline-variant flex items-center justify-center text-on-surface-variant hover:bg-surface-variant transition-colors"
                  title="Tutup"
                >
                  <Icon name="close" size={16} />
                </button>
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                  <PlaceImage
                    src={selectedGem.media?.[0]?.url}
                    alt={selectedGem.name}
                    fallbackIcon="place"
                    iconSize={32}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-headline-md text-on-surface font-bold text-base truncate">
                    {selectedGem.name}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-on-surface-variant mt-0.5">
                    <span className="flex items-center gap-1">
                      <Icon name="star" size={14} filled className="text-primary-container" />
                      {selectedGem.rating}
                    </span>
                    <span>0.2 km</span>
                  </div>
                </div>
                <button
                  onClick={() => router.push(`/detail/${selectedGem.id}`)}
                  className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center shrink-0 hover:scale-105 transition-transform"
                >
                  <Icon name="chevron_right" size={20} className="text-on-primary-container" />
                </button>
              </Card>
            </div>
          )}

          {/* FABs */}
          <div className="flex justify-end gap-3 pointer-events-auto">
            <button
              onClick={requestGpsLocation}
              title="Lokasi Saya"
              className="w-12 h-12 rounded-full bg-white dark:bg-inverse-surface border border-outline-variant shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
            >
              <Icon name="my_location" size={22} className="text-primary" />
            </button>
            <button 
              title="Tambah"
              className="w-12 h-12 rounded-full bg-primary-container shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
            >
              <Icon name="add" size={26} className="text-on-primary-container" />
            </button>
          </div>
        </div>
      </div>

      {/* GPS Permission Modal */}
      {showPermissionModal && (
        <div className="fixed inset-0 z-[2000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-background dark:bg-inverse-surface rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-outline-variant flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary-container/30 flex items-center justify-center mb-4 text-primary">
              <Icon name="location_on" size={36} />
            </div>
            <h3 className="font-headline-md text-xl font-bold text-on-surface mb-2">
              Aktifkan Lokasi Anda
            </h3>
            <p className="text-sm text-on-surface-variant mb-6">
              Jajal.in membutuhkan akses lokasi GPS untuk menemukan hidden gems dan UMKM terdekat di sekitar Anda.
            </p>
            <div className="w-full space-y-3">
              <button
                onClick={requestGpsLocation}
                className="w-full py-3 rounded-full bg-primary-container text-on-primary-container font-bold text-sm hover:brightness-105 active:scale-95 transition-all shadow-md"
              >
                Izinkan Akses Lokasi
              </button>
              <button
                onClick={handleUseDefaultLocation}
                className="w-full py-3 rounded-full bg-surface-dim dark:bg-surface-variant text-on-surface-variant font-semibold text-sm hover:brightness-95 active:scale-95 transition-all"
              >
                Gunakan Lokasi Default (Pekalongan)
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
