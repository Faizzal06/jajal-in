'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import PageShell from '@/components/layout/PageShell';
import Chip from '@/components/ui/Chip';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import Card from '@/components/ui/Card';
import { exploreApi, ExploreFeedResponse } from '@/lib/api-client';

interface FeedItem {
  id: string;
  name: string;
  description: string;
  rating: number;
  isSponsored: boolean;
  categoryName: string;
  distance: number | undefined;
  contactWhatsApp?: string;
  contactPhone?: string;
}

function contactHref(item: FeedItem): string | undefined {
  if (item.contactWhatsApp) {
    return `https://wa.me/${item.contactWhatsApp.replace(/[^0-9]/g, '')}`;
  }
  if (item.contactPhone) {
    return `tel:${item.contactPhone}`;
  }
  return undefined;
}

export default function ExploreFeedPage() {
  const router = useRouter();
  const [places, setPlaces] = useState<ExploreFeedResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFeed = useCallback(() => {
    setLoading(true);
    setError(null);
    exploreApi
      .getFeed()
      .then((data) => setPlaces(data))
      .catch(() => setError('Gagal memuat data. Periksa koneksi internet lalu coba lagi.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  if (loading) {
    return (
      <PageShell title="TemuLokal">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary-container border-t-transparent rounded-full animate-spin" />
        </div>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell title="TemuLokal">
        <div className="flex flex-col items-center justify-center h-96 gap-4 text-center">
          <Icon name="cloud_off" size={48} className="text-outline-variant" />
          <div>
            <h3 className="font-headline-md font-bold text-on-surface mb-1">Gagal Memuat Data</h3>
            <p className="text-sm text-on-surface-variant max-w-sm">{error}</p>
          </div>
          <Button variant="secondary" size="md" onClick={loadFeed}>
            Coba Lagi
          </Button>
        </div>
      </PageShell>
    );
  }

  if (places.length === 0) {
    return (
      <PageShell title="TemuLokal">
        <div className="flex flex-col items-center justify-center h-96 gap-4 text-center">
          <Icon name="explore_off" size={48} className="text-outline-variant" />
          <div>
            <h3 className="font-headline-md font-bold text-on-surface mb-1">
              Belum Ada Tempat Ditemukan
            </h3>
            <p className="text-sm text-on-surface-variant max-w-sm">
              Belum ada UMKM atau tempat tersembunyi yang terdaftar. Coba lagi nanti.
            </p>
          </div>
        </div>
      </PageShell>
    );
  }

  const feedItems: FeedItem[] = places.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    rating: p.rating ?? 0,
    isSponsored: p.is_sponsored ?? false,
    categoryName: p.categories?.name ?? '',
    distance: undefined as number | undefined,
    contactWhatsApp: p.contact_whatsapp,
    contactPhone: p.contact_phone,
  }));

  const featured = feedItems[0];
  const rest = feedItems.slice(1);

  return (
    <PageShell title="TemuLokal">
      {/* Hero Section */}
      <section className="relative rounded-full overflow-hidden h-60 md:h-80 mt-lg mb-xl bg-gradient-to-br from-primary-container/20 to-primary/10">
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="relative z-10 flex flex-col justify-end h-full p-lg md:p-xl">
          <Chip active className="w-fit mb-3 text-xs">
            Vivid Explorer Mode
          </Chip>
          <h2 className="font-headline-lg text-white text-3xl md:text-4xl font-bold mb-2">
            Radar UMKM
          </h2>
          <p className="text-white/80 text-sm md:text-base max-w-lg">
            Temukan permata tersembunyi dan produk lokal terbaik di sekitarmu dengan presisi tinggi.
          </p>
        </div>
      </section>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row gap-3 mb-xl">
        <div className="relative flex-1">
          <Icon
            name="search"
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
          />
          <input
            type="text"
            placeholder="Cari UMKM..."
            className="w-full h-12 pl-11 pr-4 bg-white border border-outline-variant rounded-full text-base text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-2 focus:border-slate-heavy transition-all"
          />
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-margin-mobile md:-mx-margin-desktop px-margin-mobile md:px-margin-desktop mb-xl">
        {['Semua', 'Kuliner', 'Kerajinan', 'Fashion', 'Oleh-oleh'].map((cat, i) => (
          <Chip key={cat} active={i === 0}>
            {cat}
          </Chip>
        ))}
      </div>

      {/* Featured Card */}
      {featured && (
        <section className="mb-xl">
          <Card padding={false} className="overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/2 h-48 md:h-auto bg-gradient-to-br from-primary-container/30 to-primary/5 flex items-center justify-center">
                <Icon name="store" size={64} className="text-primary-container" />
              </div>
              <div className="p-lg md:w-1/2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-primary-container text-on-primary-container text-xs font-bold px-3 py-1 rounded-full">
                      REKOMENDASI
                    </span>
                    <span className="text-xs text-on-surface-variant">Pilihan Editor</span>
                  </div>
                  <h3 className="font-headline-md text-on-surface font-bold mb-1">
                    {featured.name}
                  </h3>
                  <p className="text-sm text-on-surface-variant mb-3">{featured.description}</p>
                  <div className="flex items-center gap-3 text-sm text-on-surface-variant mb-4">
                    <span className="flex items-center gap-1">
                      <Icon name="star" size={16} filled className="text-primary-container" />
                      {featured.rating}
                    </span>
                    {featured.distance && (
                      <span className="flex items-center gap-1">
                        <Icon name="location_on" size={16} />
                        {featured.distance}km dari lokasimu
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-3">
                  {contactHref(featured) && (
                    <Button variant="secondary" size="sm" href={contactHref(featured)}>
                      Hubungi
                    </Button>
                  )}
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => router.push(`/detail/${featured.id}`)}
                  >
                    Detail
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </section>
      )}

      {/* Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg mb-xl">
        {rest.map((m) => (
          <Card key={m.id} className="flex flex-col">
            <div className="h-32 bg-gradient-to-br from-surface-dim to-background rounded-xl mb-3 flex items-center justify-center">
              <Icon name="storefront" size={40} className="text-outline-variant" />
            </div>
            <div className="flex items-center gap-2 mb-2">
              {m.categoryName && (
                <span className="bg-[#E5E7EB] text-slate-heavy text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {m.categoryName}
                </span>
              )}
              {m.isSponsored && (
                <span className="bg-primary-container text-on-primary-container text-xs font-bold px-2.5 py-0.5 rounded-full">
                  SPONSORED
                </span>
              )}
            </div>
            <h4 className="font-headline-md text-on-surface font-bold text-lg mb-1">{m.name}</h4>
            <p className="text-sm text-on-surface-variant mb-3 line-clamp-2 flex-1">
              {m.description}
            </p>
            <div className="flex items-center gap-3 text-sm text-on-surface-variant mb-3">
              <span className="flex items-center gap-1">
                <Icon name="star" size={14} filled className="text-primary-container" />
                {m.rating}
              </span>
              {m.distance && (
                <span className="flex items-center gap-1">
                  <Icon name="location_on" size={14} />
                  {m.distance}km
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                className="flex-1"
                onClick={() => router.push(`/detail/${m.id}`)}
              >
                Detail
              </Button>
              {contactHref(m) && (
                <Button variant="ghost" size="sm" href={contactHref(m)}>
                  Hubungi
                </Button>
              )}
            </div>
          </Card>
        ))}

        {/* Dekat Denganmu Card */}
        <Card className="bg-primary-container/20 border-primary-container flex flex-col items-center justify-center text-center p-xl">
          <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center mb-4 animate-pulse">
            <Icon name="explore" size={32} className="text-on-primary-container" />
          </div>
          <h4 className="font-headline-md text-on-surface font-bold mb-2">Dekat Denganmu</h4>
          <p className="text-sm text-on-surface-variant mb-4">
            Ada 12 UMKM baru yang buka di radius 500 meter dari lokasimu saat ini.
          </p>
          <Button variant="secondary" size="md">
            Lihat di Peta
          </Button>
        </Card>
      </section>

      {/* CTA Section */}
      <section className="bg-slate-heavy rounded-full p-xl md:p-xl text-center mb-xl">
        <h3 className="font-headline-md text-white font-bold mb-2">Punya Usaha Lokal?</h3>
        <p className="text-white/70 text-sm mb-4 max-w-md mx-auto">
          Daftarkan UMKM Anda dan jangkau ribuan traveler yang mencari keunikan lokal di TemuLokal.
        </p>
        <Button
          variant="primary"
          size="lg"
          className="shadow-[0_0_20px_rgba(163,230,53,0.3)] hover:shadow-[0_0_30px_rgba(163,230,53,0.5)] transition-shadow"
        >
          Daftarkan Sekarang
        </Button>
      </section>

      {/* Mobile FAB */}
      <div className="fixed bottom-20 right-6 z-30 md:hidden">
        <button className="w-14 h-14 rounded-full bg-primary-container shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform">
          <Icon name="near_me" size={28} className="text-on-primary-container" />
        </button>
      </div>
    </PageShell>
  );
}
