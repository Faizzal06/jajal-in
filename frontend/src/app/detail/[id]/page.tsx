'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PageShell from '@/components/layout/PageShell';
import Icon from '@/components/ui/Icon';
import Card from '@/components/ui/Card';
import Desk from '@/components/ui/Desk';
import MapStatic from '@/components/ui/MapStatic';
import PlaceImage from '@/components/ui/PlaceImage';
import { gems, reviews } from '@/lib/mock/gems';
import { merchants } from '@/lib/mock/merchants';
import { Gem, Merchant, Review } from '@/lib/types';
import { placesApi, PlaceDetailResponse } from '@/lib/api-client';
import Loading from '@/app/loading';

function RatingStars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Icon
          key={i}
          name="star"
          size={14}
          filled={i < full || (i === full && half)}
          className={i < full || (i === full && half) ? 'text-primary-container' : 'text-outline-variant'}
        />
      ))}
    </span>
  );
}

export default function DetailPage() {
  const params = useParams<{ id: string }>();
  const [place, setPlace] = useState<PlaceDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;
    placesApi
      .getById(params.id as string)
      .then((data) => setPlace(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <PageShell variant="back" title="Jajal.in" hideNav>
        <div className="py-lg">
          <Loading />
        </div>
      </PageShell>
    );
  }

  if (place) {
    if (place.type === 'merchant') {
      const merchant: Merchant = {
        id: place.id,
        slug: place.slug,
        name: place.name,
        ownerId: '',
        region: { id: '', name: place.regions?.name ?? '', slug: place.regions?.slug ?? '' },
        category: { id: '', name: place.categories?.name ?? '', slug: '', applicableTo: 'merchant', icon: place.categories?.icon ?? '' },
        description: place.description,
        lat: place.lat ?? 0,
        lng: place.lng ?? 0,
        address: place.address,
        rating: place.rating ?? 0,
        reviewCount: place.review_count ?? 0,
        contactWhatsApp: place.contact_whatsapp,
        contactPhone: place.contact_phone,
        status: 'active',
        isSponsored: place.is_sponsored ?? false,
        media: (place.place_media ?? []).map((m) => m.url),
        products: (place.products ?? []).map((p) => ({ id: p.id, name: p.name, price: p.price, description: p.description, imageUrl: p.image_url ?? '' })),
      };
      return <MerchantDetail merchant={merchant} />;
    }
    const gem: Gem = {
      id: place.id,
      slug: place.slug,
      name: place.name,
      region: { id: '', name: place.regions?.name ?? '', slug: place.regions?.slug ?? '' },
      category: { id: '', name: place.categories?.name ?? '', slug: '', applicableTo: 'gem', icon: place.categories?.icon ?? '' },
      description: place.description,
      lat: place.lat ?? 0,
      lng: place.lng ?? 0,
      address: place.address,
      rating: place.rating ?? 0,
      reviewCount: place.review_count ?? 0,
      status: 'approved',
      isSponsored: place.is_sponsored ?? false,
      media: (place.place_media ?? []).map((m) => ({ id: '', url: m.url, mediaType: m.media_type as 'image' | 'video', caption: m.caption })),
      audioStory: place.audio_stories?.[0]
        ? { id: '', title: place.audio_stories[0].title, narrator: place.audio_stories[0].narrator, duration: place.audio_stories[0].duration, url: place.audio_stories[0].url }
        : undefined,
      highlights: (place.place_highlights ?? []).map((h) => ({
        id: h.id,
        title: h.title,
        description: h.description,
        icon: h.icon,
      })),
      tags: [],
    };
    const apiReviews = (place.reviews ?? []).map((r) => ({
      id: r.id,
      user: {
        id: '',
        googleId: '',
        email: '',
        name: r.users?.name ?? 'Anonim',
        avatarUrl: r.users?.avatar_url ?? '',
        role: 'user' as const,
        region: { id: '', name: '', slug: '' },
        level: { id: '', number: 1, name: 'Explorer', xpRequired: 0 },
        totalXp: 0,
        totalContributions: 0,
        totalPhotos: 0,
        rating: 0,
      },
      gemId: place.id,
      rating: r.rating,
      text: r.text,
      date: new Date(r.created_at).toLocaleDateString('id-ID'),
      isTip: r.is_tip,
    }));
    return <GemDetail gem={gem} gemReviews={apiReviews} />;
  }

  // Fallback to mock data
  const mockGem = gems.find((g) => g.slug === params.id || g.id === params.id);
  const mockMerchant = merchants.find((m) => m.slug === params.id || m.id === params.id);
  if (!mockGem && !mockMerchant) {
    return (
      <PageShell variant="back" title="Jajal.in" hideNav>
        <div className="flex items-center justify-center h-64">
          <p className="text-on-surface-variant font-medium">Tempat tidak ditemukan</p>
        </div>
      </PageShell>
    );
  }
  if (mockMerchant) return <MerchantDetail merchant={mockMerchant} />;
  return <GemDetail gem={mockGem!} />;
}

function GemDetail({ gem, gemReviews: propReviews }: { gem: Gem; gemReviews?: Review[] }) {
  const router = useRouter();
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const heroImage =
    gem.media?.[0]?.url ||
    'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=1200&auto=format&fit=crop';
  const gemReviews = propReviews ?? reviews.filter((r) => r.gemId === gem.id);

  return (
    <PageShell variant="back" title="Jajal.in" hideNav>
      <div className="max-w-7xl mx-auto space-y-xl pb-32">
        {/* Custom Header Actions */}
        <div className="flex items-center justify-between py-2 border-b border-outline-variant/40">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-semibold text-on-surface hover:text-primary transition-colors"
          >
            <Icon name="arrow_back" size={20} />
            <span>Kembali</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => alert('Link tempat berhasil disalin!')}
              className="p-2 rounded-full hover:bg-surface-dim transition-colors text-on-surface-variant"
              title="Bagikan"
            >
              <Icon name="share" size={20} />
            </button>
            <button
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={`p-2 rounded-full transition-colors ${
                isBookmarked ? 'bg-primary-container text-on-primary-container' : 'hover:bg-surface-dim text-on-surface-variant'
              }`}
              title="Simpan Tempat"
            >
              <Icon name="bookmark" size={20} filled={isBookmarked} />
            </button>
          </div>
        </div>

        {/* Hero Section: Immersive Photography (Vivid Explorer Design - Non-Booking) */}
        <section className="relative h-[55vh] md:h-[65vh] rounded-3xl overflow-hidden group shadow-lg">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: `url('${heroImage}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-heavy/90 via-slate-heavy/30 to-transparent" />
          <div className="absolute bottom-0 left-0 p-lg w-full flex flex-col md:flex-row md:items-end justify-between gap-md">
            <div className="space-y-sm max-w-2xl">
              <div className="flex flex-wrap gap-2">
                <span className="bg-primary-container text-on-primary-container font-label-sm text-xs px-3.5 py-1 rounded-full flex items-center gap-1 uppercase tracking-wider font-bold">
                  <Icon name="star" size={14} filled />
                  {gem.isSponsored ? 'DIPROMOSIKAN' : 'HIDDEN GEM'}
                </span>
                <span className="bg-slate-heavy text-white font-label-sm text-xs px-3.5 py-1 rounded-full uppercase tracking-wider font-semibold">
                  {gem.region.name}
                </span>
              </div>
              <h1 className="font-headline-xl text-white text-3xl md:text-5xl font-bold leading-tight drop-shadow-md">
                {gem.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm">
                <span className="flex items-center gap-1 font-medium">
                  <Icon name="location_on" size={18} className="text-primary-container" />
                  {gem.region.name}
                </span>
                <span className="flex items-center gap-1 font-medium">
                  <Icon name="schedule" size={18} className="text-primary-container" />
                  Best at 11:30 AM
                </span>
                <span className="flex items-center gap-1 font-medium">
                  <RatingStars rating={gem.rating} />
                  {gem.rating} ({gem.reviewCount} ulasan)
                </span>
              </div>
            </div>
            <a
              href={`https://maps.google.com/?q=${gem.lat},${gem.lng}`}
              target="_blank"
              rel="noreferrer"
              className="bg-primary-container text-slate-heavy font-bold px-7 py-3.5 rounded-full hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 shrink-0"
            >
              <Icon name="explore" size={20} />
              PETUNJUK ARAH
            </a>
          </div>
        </section>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
          {/* Left Column: Story & Details */}
          <div className="lg:col-span-8 space-y-lg">
            {/* Audio Story Section (HANYA tampil jika data audioStory ada) */}
            {gem.audioStory && (gem.audioStory.title || gem.audioStory.url) && (
              <section className="bg-white border border-outline-variant p-lg rounded-3xl space-y-md relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none">
                  <Icon name="graphic_eq" size={120} className="text-primary" filled />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-headline-md text-xl font-bold text-slate-heavy">
                      {gem.audioStory.title || 'Audio Story Local'}
                    </h3>
                    <p className="text-sm text-on-surface-variant">
                      Dengarkan cerita narasi dan legenda lokal tempat ini (tersimpan di <code>audio-stories</code>).
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-on-surface-variant bg-surface-dim px-2.5 py-1 rounded-full">
                      {gem.audioStory.duration || 'Opsional'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-md">
                  <button
                    onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-white transition-all active:scale-90 ${
                      isPlayingAudio ? 'bg-primary' : 'bg-slate-heavy hover:bg-primary'
                    }`}
                    id="audioToggle"
                  >
                    <Icon name={isPlayingAudio ? 'pause' : 'play_arrow'} size={32} />
                  </button>
                  <div className="flex-1 space-y-1">
                    <div className="h-2 bg-surface-dim rounded-full overflow-hidden relative cursor-pointer">
                      <div
                        className={`h-full bg-primary-container rounded-full relative transition-all duration-300 ${
                          isPlayingAudio ? 'w-[65%]' : 'w-[25%]'
                        }`}
                      >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-slate-heavy rounded-full border-2 border-white shadow-md" />
                      </div>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                      <span>Dinarasikan oleh {gem.audioStory.narrator || 'Penjelajah Lokal'}</span>
                      <span>{isPlayingAudio ? 'Playing' : 'Paused'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <div className={`w-1 h-4 bg-primary-container ${isPlayingAudio ? 'animate-pulse' : ''}`} />
                    <div className={`w-1 h-8 bg-primary-container ${isPlayingAudio ? 'animate-pulse delay-75' : ''}`} />
                    <div className={`w-1 h-6 bg-primary-container ${isPlayingAudio ? 'animate-pulse delay-150' : ''}`} />
                    <div className={`w-1 h-3 bg-primary-container ${isPlayingAudio ? 'animate-pulse delay-200' : ''}`} />
                  </div>
                </div>
              </section>
            )}

            {/* Experience Highlights Bento Grid */}
            <section className="space-y-md">
              <h3 className="font-headline-md text-xl font-bold text-on-surface">Experience Highlights</h3>
              {gem.highlights && gem.highlights.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  {gem.highlights.map((hl, i) => (
                    <div
                      key={hl.id || i}
                      className={`p-lg rounded-3xl flex flex-col justify-between h-56 transition-colors ${
                        i % 2 === 1
                          ? 'bg-primary text-white'
                          : 'bg-white border border-outline-variant hover:border-primary-container'
                      }`}
                    >
                      <Icon
                        name={hl.icon || 'landscape'}
                        size={36}
                        className={i % 2 === 1 ? 'text-primary-container' : 'text-primary'}
                        filled
                      />
                      <div>
                        <h4 className={`font-bold text-lg mb-1 ${i % 2 === 1 ? 'text-white' : 'text-on-surface'}`}>
                          {hl.title}
                        </h4>
                        <p className={`text-sm ${i % 2 === 1 ? 'text-white/80' : 'text-on-surface-variant'}`}>
                          {hl.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-outline-variant/60 p-lg rounded-3xl text-center text-on-surface-variant space-y-2">
                  <Icon name="info" size={32} className="mx-auto text-outline-variant" />
                  <p className="font-bold text-base text-on-surface">Experience Highlights</p>
                  <p className="text-xs text-on-surface-variant">Tidak tersedia</p>
                </div>
              )}
            </section>

            {/* Description & Tags */}
            <Card>
              <h3 className="font-headline-md text-xl font-bold text-on-surface mb-2">Cerita & Deskripsi</h3>
              <p className="text-on-surface-variant leading-relaxed text-sm md:text-base">
                {gem.description}
              </p>
              {gem.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {gem.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-surface-dim text-slate-heavy text-xs font-semibold px-3 py-1 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </Card>

            {/* Map Section */}
            <section className="bg-white border border-outline-variant rounded-3xl overflow-hidden">
              <div className="p-lg flex justify-between items-center border-b border-outline-variant/30">
                <h3 className="font-headline-md text-xl font-bold text-on-surface">Lokasi Presisi</h3>
                <a
                  href={`https://maps.google.com/?q=${gem.lat},${gem.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary font-bold text-xs flex items-center gap-1 hover:underline uppercase tracking-wider"
                >
                  OPEN IN MAPS <Icon name="open_in_new" size={16} />
                </a>
              </div>
              <div className="relative">
                <MapStatic lat={gem.lat} lng={gem.lng} label={gem.name} height="h-64" />
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-outline-variant flex items-center gap-2">
                  <span className="w-3 h-3 bg-primary rounded-full animate-ping" />
                  <span className="font-bold text-xs text-on-surface">{gem.name}</span>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Info & Community (Non-Booking Sidebar) */}
          <aside className="lg:col-span-4 space-y-lg">
            <div className="bg-white border border-outline-variant p-lg rounded-3xl sticky top-20 shadow-sm space-y-md">
              <h3 className="font-headline-md text-xl font-bold text-slate-heavy">Info Tempat & Akses</h3>
              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <Icon name="location_on" size={20} className="text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-on-surface">Wilayah</p>
                    <p className="text-on-surface-variant">{gem.region.name}</p>
                  </div>
                </div>
                {gem.address && (
                  <div className="flex items-start gap-3">
                    <Icon name="home_pin" size={20} className="text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-on-surface">Alamat Lengkap</p>
                      <p className="text-on-surface-variant">{gem.address}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <Icon name="category" size={20} className="text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-on-surface">Kategori</p>
                    <p className="text-on-surface-variant">{gem.category.name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="schedule" size={20} className="text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-on-surface">Waktu Kunjungan Terbaik</p>
                    <p className="text-on-surface-variant">Pagi - Siang Hari (10:00 - 14:00 WIB)</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-outline-variant/40">
                  <a
                    href={`https://maps.google.com/?q=${gem.lat},${gem.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-slate-heavy text-white font-bold py-3.5 rounded-full hover:bg-primary transition-all flex items-center justify-center gap-2 text-sm shadow-md"
                  >
                    <Icon name="map" size={20} /> Buka di Google Maps
                  </a>
                </div>
              </div>
            </div>

            {/* Community Reviews */}
            <div className="bg-white border border-outline-variant p-lg rounded-3xl space-y-md">
              <h4 className="font-bold text-lg text-on-surface">Traveler Reviews</h4>
              <div className="space-y-4">
                {gemReviews.map((review) => (
                  <div key={review.id} className="flex gap-3 pb-3 border-b border-outline-variant/30 last:border-none last:pb-0">
                    <div className="w-10 h-10 rounded-full bg-primary-container/30 flex items-center justify-center font-bold text-primary shrink-0">
                      {review.user.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-on-surface">{review.user.name}</p>
                        <RatingStars rating={review.rating} />
                      </div>
                      <p className="text-xs text-on-surface-variant italic leading-relaxed">
                        &quot;{review.text}&quot;
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </PageShell>
  );
}

function MerchantDetail({ merchant }: { merchant: Merchant }) {
  const router = useRouter();
  const heroImage =
    merchant.media?.[0] ||
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop';

  return (
    <PageShell variant="back" title="Jajal.in" hideNav>
      <div className="max-w-7xl mx-auto space-y-xl pb-32">
        {/* Custom Header Actions */}
        <div className="flex items-center justify-between py-2 border-b border-outline-variant/40">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-semibold text-on-surface hover:text-primary transition-colors"
          >
            <Icon name="arrow_back" size={20} />
            <span>Kembali</span>
          </button>
          <button
            onClick={() => alert('Link merchant berhasil disalin!')}
            className="p-2 rounded-full hover:bg-surface-dim transition-colors text-on-surface-variant"
          >
            <Icon name="share" size={20} />
          </button>
        </div>

        {/* Hero Section */}
        <section className="relative h-[45vh] md:h-[55vh] rounded-3xl overflow-hidden group shadow-lg">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: `url('${heroImage}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-heavy/90 via-slate-heavy/30 to-transparent" />
          <div className="absolute bottom-0 left-0 p-lg w-full flex flex-col md:flex-row md:items-end justify-between gap-md">
            <div className="space-y-sm">
              <div className="flex flex-wrap gap-2">
                <span className="bg-primary-container text-on-primary-container font-label-sm text-xs px-3.5 py-1 rounded-full font-bold uppercase tracking-wider">
                  {merchant.isSponsored ? 'DIPROMOSIKAN' : 'UMKM LOKAL'}
                </span>
                <span className="bg-slate-heavy text-white font-label-sm text-xs px-3.5 py-1 rounded-full font-semibold">
                  {merchant.category.name}
                </span>
              </div>
              <h1 className="font-headline-xl text-white text-3xl md:text-5xl font-bold leading-tight drop-shadow-md">
                {merchant.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm">
                <RatingStars rating={merchant.rating} />
                <span className="font-medium">
                  {merchant.rating} ({merchant.reviewCount} ulasan)
                </span>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
          <div className="lg:col-span-8 space-y-lg">
            <Desk>
              <h3 className="font-headline-md text-xl font-bold text-on-surface mb-2">Tentang UMKM</h3>
              <p className="text-on-surface-variant leading-relaxed text-sm md:text-base">
                {merchant.description}
              </p>
            </Desk>

            <div>
              <h3 className="font-headline-md text-xl font-bold text-on-surface mb-3">Katalog Produk</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {merchant.products.map((product) => (
                  <Card key={product.id} className="flex flex-col">
                    <div className="h-40 bg-surface-dim rounded-2xl mb-3 flex items-center justify-center overflow-hidden">
                      <PlaceImage
                        src={product.imageUrl}
                        alt={product.name}
                        fallbackIcon="inventory_2"
                        iconSize={48}
                        iconClassName="text-outline-variant"
                        containerClassName="w-full h-full bg-surface-dim flex items-center justify-center"
                      />
                    </div>
                    <h4 className="font-bold text-base text-on-surface mb-1">{product.name}</h4>
                    <p className="text-xs text-on-surface-variant mb-3 flex-1">{product.description}</p>
                    <p className="font-headline-md font-bold text-primary text-lg">
                      Rp {product.price.toLocaleString('id-ID')}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-lg">
            <Desk className="sticky top-20 space-y-4">
              <h3 className="font-headline-md text-xl font-bold text-on-surface mb-2">Kontak & Pesanan</h3>
              <div className="space-y-3">
                {merchant.address && (
                  <div className="flex items-start gap-3 mb-2">
                    <Icon name="home_pin" size={20} className="text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-on-surface text-sm">Alamat Lengkap</p>
                      <p className="text-on-surface-variant text-sm">{merchant.address}</p>
                    </div>
                  </div>
                )}
                {merchant.contactWhatsApp && (
                  <a
                    href={`https://wa.me/${merchant.contactWhatsApp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-primary-container text-on-primary-container font-bold py-3.5 rounded-full flex items-center justify-center gap-2 hover:shadow-md transition-all text-sm"
                  >
                    <Icon name="chat" size={20} /> Hubungi via WhatsApp
                  </a>
                )}
                {merchant.contactPhone && (
                  <a
                    href={`tel:${merchant.contactPhone}`}
                    className="w-full border border-slate-heavy text-slate-heavy font-bold py-3.5 rounded-full flex items-center justify-center gap-2 hover:bg-surface-dim transition-all text-sm"
                  >
                    <Icon name="phone" size={20} /> Telepon Direct
                  </a>
                )}
                <MapStatic lat={merchant.lat} lng={merchant.lng} label={merchant.name} height="h-40" />
              </div>
            </Desk>
          </aside>
        </div>
      </div>
    </PageShell>
  );
}
