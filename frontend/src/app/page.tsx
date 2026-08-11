import { Suspense } from 'react';
import Card from '@/components/ui/Card';
import Chip from '@/components/ui/Chip';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import PlaceImage from '@/components/ui/PlaceImage';
import PageShell from '@/components/layout/PageShell';
import { exploreApi, ExploreFeedResponse } from '@/lib/api-client';
import Link from 'next/link';

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
  imageUrl?: string;
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

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

function FeedSkeleton() {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="border border-outline-variant rounded-xl overflow-hidden animate-pulse bg-surface">
          <div className="h-48 w-full bg-gray-200" />
          <div className="p-lg">
            <div className="h-5 w-3/4 bg-gray-200 rounded" />
            <div className="mt-2 h-4 w-full bg-gray-200 rounded" />
            <div className="mt-1 h-4 w-5/6 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </section>
  );
}

async function ExploreFeedContent() {
  let places: ExploreFeedResponse[] = [];
  let error: string | null = null;

  try {
    places = await exploreApi.getFeed();
    await delay(1000);
  } catch {
    error = 'Gagal memuat data. Periksa koneksi internet lalu coba lagi.';
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4 text-center">
        <Icon name="cloud_off" size={48} className="text-outline-variant" />
        <div>
          <h3 className="font-headline-md font-bold text-on-surface mb-1">Gagal Memuat Data</h3>
          <p className="text-sm text-on-surface-variant max-w-sm">{error}</p>
        </div>
        <Button variant="secondary" size="md" href="/">
          Coba Lagi
        </Button>
      </div>
    );
  }

  if (places.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4 text-center">
        <Icon name="explore_off" size={48} className="text-outline-variant" />
        <div>
          <h3 className="font-headline-md font-bold text-on-surface mb-1">Belum Ada Tempat Ditemukan</h3>
          <p className="text-sm text-on-surface-variant max-w-sm">
            Belum ada UMKM atau tempat tersembunyi yang terdaftar. Coba lagi nanti.
          </p>
        </div>
      </div>
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
    imageUrl: p.place_media?.[0]?.url,
  }));

  const featured = feedItems[0];
  const rest = feedItems.slice(1);

  return (
    <>
      {/* Hero Section */}
      <section className="relative rounded-full overflow-hidden h-60 md:h-80 mt-lg mb-xl bg-gradient-to-br from-primary-container/20 to-primary/10">
        <div className="absolute inset-0 flex items-center justify-center opacity-40">
          <Icon name="image" size={96} className="text-primary" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="relative z-10 flex flex-col justify-end h-full p-lg md:p-xl">
          <Chip active className="w-fit mb-3 text-xs">Vivid Explorer Mode</Chip>
          <h2 className="font-headline-lg text-white text-3xl md:text-4xl font-bold mb-2">Radar UMKM</h2>
          <p className="text-white/80 text-sm md:text-base max-w-lg">
            Temukan permata tersembunyi dan produk lokal terbaik di sekitarmu dengan presisi tinggi.
          </p>
        </div>
      </section>

      {/* Search & Category */}
      <div className="flex flex-col sm:flex-row gap-3 mb-xl">
        <div className="relative flex-1">
          <Icon name="search" size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
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
              <div className="md:w-1/2 h-48 md:h-auto overflow-hidden min-h-[12rem]">
                <PlaceImage src={featured.imageUrl} alt={featured.name} />
              </div>
              <div className="p-lg md:w-1/2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-primary-container text-on-primary-container text-xs font-bold px-3 py-1 rounded-full">REKOMENDASI</span>
                    <span className="text-xs text-on-surface-variant">Pilihan Editor</span>
                  </div>
                  <h3 className="font-headline-md text-on-surface font-bold mb-1">{featured.name}</h3>
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
                    <Button variant="secondary" size="sm" href={contactHref(featured)}>Hubungi</Button>
                  )}
                  <Button variant="primary" size="sm" href={`/detail/${featured.id}`}>Detail</Button>
                </div>
              </div>
            </div>
          </Card>
        </section>
      )}

      {/* Grid of Cards */}
      <section className="grid grid-cols-1 gap-lg mb-xl">
        {rest.map((m) => (
          <Card key={m.id} padding={false} className="overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/2 h-48 md:h-auto overflow-hidden min-h-[12rem]">
                <PlaceImage src={m.imageUrl} alt={m.name} />
              </div>
              <div className="p-lg md:w-1/2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {m.categoryName && (
                      <span className="bg-[#E5E7EB] text-slate-heavy text-xs font-medium px-3 py-1 rounded-full">{m.categoryName}</span>
                    )}
                    {m.isSponsored && (
                      <span className="bg-primary-container text-on-primary-container text-xs font-bold px-3 py-1 rounded-full">SPONSORED</span>
                    )}
                  </div>
                  <h3 className="font-headline-md text-on-surface font-bold mb-1">{m.name}</h3>
                  <p className="text-sm text-on-surface-variant mb-3 line-clamp-2">{m.description}</p>
                  <div className="flex items-center gap-3 text-sm text-on-surface-variant mb-4">
                    <span className="flex items-center gap-1">
                      <Icon name="star" size={16} filled className="text-primary-container" />
                      {m.rating}
                    </span>
                    {m.distance && (
                      <span className="flex items-center gap-1">
                        <Icon name="location_on" size={16} />
                        {m.distance}km
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-3">
                  {contactHref(m) && (
                    <Button variant="secondary" size="sm" href={contactHref(m)}>Hubungi</Button>
                  )}
                  <Button variant="primary" size="sm" href={`/detail/${m.id}`}>Detail</Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
        {/* "Dekat Denganmu" banner card */}
        <Card className="bg-primary-container/20 border-primary-container flex flex-col items-center justify-center text-center p-xl">
          <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center mb-4 animate-pulse">
            <Icon name="explore" size={32} className="text-on-primary-container" />
          </div>
          <h4 className="font-headline-md text-on-surface font-bold mb-2">Dekat Denganmu</h4>
          <p className="text-sm text-on-surface-variant mb-4">
            Ada 12 UMKM baru yang buka di radius 500 meter dari lokasimu saat ini.
          </p>
          <Button variant="secondary" size="md" href="/map">Lihat di Peta</Button>
        </Card>
      </section>

      {/* CTA */}
      <section className="bg-slate-heavy rounded-full p-xl md:p-xl text-center mb-xl">
        <h3 className="font-headline-md text-white font-bold mb-2">Punya Usaha Lokal?</h3>
        <p className="text-white/70 text-sm mb-4 max-w-md mx-auto">
          Daftarkan UMKM Anda dan jangkau ribuan traveler yang mencari keunikan lokal di Jajal.in.
        </p>
        <Button
          variant="primary"
          size="lg"
          href="/register-merchant"
          className="shadow-[0_0_20px_rgba(163,230,53,0.3)] hover:shadow-[0_0_30px_rgba(163,230,53,0.5)] transition-shadow"
        >
          Daftarkan Sekarang
        </Button>
      </section>

      {/* Mobile FAB */}
      <div className="fixed bottom-20 right-6 z-30 md:hidden">
        <Link href="/map" className="w-14 h-14 rounded-full bg-primary-container shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform">
          <Icon name="near_me" size={28} className="text-on-primary-container" />
        </Link>
      </div>
    </>
  );
}

export default function ExploreFeedPage() {
  return (
    <PageShell title="Jajal.in">
      <Suspense fallback={<FeedSkeleton />}>
        <ExploreFeedContent />
      </Suspense>
    </PageShell>
  );
}
