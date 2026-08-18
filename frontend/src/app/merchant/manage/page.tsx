'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TopAppBar from '@/components/layout/TopAppBar';
import Icon from '@/components/ui/Icon';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Desk from '@/components/ui/Desk';
import Loading from '@/app/loading';
import { merchantApi, MyMerchantResponse, getAuthToken } from '@/lib/api-client';
import { useAuth } from '@/lib/context/AuthContext';
import { adPackages, bankAccounts } from '@/lib/mock/merchants';

export default function ManageMerchantPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [merchants, setMerchants] = useState<MyMerchantResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [promoteModalMerchant, setPromoteModalMerchant] = useState<MyMerchantResponse | null>(null);
  const [promoteSuccess, setPromoteSuccess] = useState(false);
  const [copiedBankId, setCopiedBankId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user && !getAuthToken()) {
      router.replace('/login?redirect=/merchant/manage');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      merchantApi
        .getMyMerchants()
        .then((data) => setMerchants(data))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleCopy = (bankId: string, accNumber: string) => {
    navigator.clipboard.writeText(accNumber);
    setCopiedBankId(bankId);
    setTimeout(() => setCopiedBankId(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-primary-container text-on-primary-container">
            <Icon name="verified" size={14} /> Aktif & Terverifikasi
          </span>
        );
      case 'pending':
      case 'pending_payment':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Icon name="hourglass_top" size={14} /> Menunggu Verifikasi
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-error/10 text-error border border-error/30">
            <Icon name="cancel" size={14} /> Ditolak
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-surface-container text-on-surface-variant">
            {status}
          </span>
        );
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <TopAppBar variant="back" title="Kelola Merchant" />
        <div className="flex-1 flex items-center justify-center">
          <Loading />
        </div>
      </div>
    );
  }

  const adPackage = adPackages[0];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopAppBar variant="back" title="Kelola Merchant" />

      <main className="flex-1 max-w-4xl mx-auto w-full px-margin-mobile md:px-margin-desktop py-lg pb-24 space-y-lg">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-headline-md text-2xl font-bold text-on-surface">Merchant & Usaha Anda</h1>
            <p className="text-sm text-on-surface-variant">
              Kelola profil gerai, pantau status verifikasi, dan aktifkan promosi prioritas (Open Promote).
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            className="shrink-0 font-bold"
            onClick={() => router.push('/register-merchant')}
          >
            <Icon name="add" size={20} /> Daftarkan Usaha Baru
          </Button>
        </div>

        {/* Empty state */}
        {merchants.length === 0 && (
          <Card className="text-center py-16 px-6 space-y-4 border-dashed border-2">
            <div className="w-20 h-20 rounded-full bg-primary-container/20 flex items-center justify-center mx-auto text-primary">
              <Icon name="storefront" size={40} />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="font-headline-md text-lg font-bold text-on-surface">Belum Ada Usaha Terdaftar</h3>
              <p className="text-sm text-on-surface-variant">
                Daftarkan UMKM atau usaha lokal Anda secara gratis untuk menjangkau ribuan penjelajah di Jajal.in.
              </p>
            </div>
            <Button variant="primary" size="md" onClick={() => router.push('/register-merchant')}>
              <Icon name="add" size={20} /> Daftarkan Usaha Sekarang (Gratis)
            </Button>
          </Card>
        )}

        {/* Merchant Cards List */}
        <div className="space-y-6">
          {merchants.map((merchant) => {
            const coverImage = merchant.place_media?.[0]?.url;
            return (
              <Card key={merchant.id} className="p-6 space-y-5 hover:border-primary transition-colors">
                <div className="flex flex-col md:flex-row gap-5">
                  {/* Image / Thumbnail */}
                  <div className="w-full md:w-48 h-40 rounded-2xl bg-surface-dim overflow-hidden shrink-0 border border-outline-variant relative">
                    {coverImage ? (
                      <img
                        src={coverImage}
                        alt={merchant.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-outline-variant gap-1">
                        <Icon name="storefront" size={36} />
                        <span className="text-[11px] text-on-surface-variant">Tanpa Foto Sampul</span>
                      </div>
                    )}
                    {merchant.is_sponsored && (
                      <span className="absolute top-2 left-2 bg-primary-container text-on-primary-container font-bold text-[10px] px-2 py-0.5 rounded-full shadow">
                        SPONSORED
                      </span>
                    )}
                  </div>

                  {/* Merchant Details */}
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-headline-md text-xl font-bold text-on-surface">
                          {merchant.name}
                        </h3>
                        {merchant.categories && (
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-medium">
                            {merchant.categories.name}
                          </span>
                        )}
                      </div>
                      <div>{getStatusBadge(merchant.status)}</div>
                    </div>

                    <p className="text-sm text-on-surface-variant line-clamp-2">
                      {merchant.description || 'Tidak ada deskripsi.'}
                    </p>

                    <div className="flex flex-wrap gap-y-1 gap-x-4 text-xs text-on-surface-variant pt-1">
                      {merchant.address && (
                        <span className="flex items-center gap-1">
                          <Icon name="location_on" size={16} className="text-primary" /> {merchant.address}
                        </span>
                      )}
                      {merchant.regions && (
                        <span className="flex items-center gap-1">
                          <Icon name="map" size={16} className="text-primary" /> {merchant.regions.name}
                        </span>
                      )}
                      {merchant.contact_whatsapp && (
                        <span className="flex items-center gap-1">
                          <Icon name="call" size={16} className="text-primary" /> {merchant.contact_whatsapp}
                        </span>
                      )}
                      {merchant.products && merchant.products.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Icon name="inventory_2" size={16} className="text-primary" /> {merchant.products.length} Produk
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Products Preview */}
                {merchant.products && merchant.products.length > 0 && (
                  <div className="pt-3 border-t border-outline-variant/40 space-y-2">
                    <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider">Katalog Produk Unggulan</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {merchant.products.slice(0, 3).map((p) => (
                        <div key={p.id} className="p-2.5 bg-surface-dim/30 rounded-xl border border-outline-variant flex items-center gap-3">
                          {p.image_url ? (
                            <img src={p.image_url} alt={p.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center shrink-0">
                              <Icon name="shopping_bag" size={18} className="text-outline" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-on-surface truncate">{p.name}</p>
                            <p className="text-[11px] font-bold text-primary">Rp {p.price.toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Row */}
                <div className="pt-3 border-t border-outline-variant/40 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {merchant.is_sponsored ? (
                      <span className="text-xs font-bold text-primary flex items-center gap-1 bg-primary-container/30 px-3 py-1.5 rounded-full">
                        <Icon name="bolt" size={16} /> Open Promote Aktif (Sponsored)
                      </span>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setPromoteModalMerchant(merchant);
                          setPromoteSuccess(false);
                        }}
                        className="font-bold flex items-center gap-1.5"
                      >
                        <Icon name="campaign" size={18} /> Open Promote
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/detail/${merchant.id}`)}
                    >
                      <Icon name="visibility" size={16} /> Lihat Tempat
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </main>

      {/* Open Promote Modal */}
      {promoteModalMerchant && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background rounded-3xl max-w-lg w-full p-6 space-y-5 border border-outline-variant max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-outline-variant pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container">
                  <Icon name="campaign" size={18} />
                </div>
                <h3 className="font-headline-md text-lg font-bold text-on-surface">Open Promote UMKM</h3>
              </div>
              <button
                onClick={() => setPromoteModalMerchant(null)}
                className="p-1 rounded-full hover:bg-surface-dim transition-colors"
              >
                <Icon name="close" size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-on-surface-variant">Promosikan gerai Anda:</p>
                <h4 className="font-bold text-base text-on-surface">{promoteModalMerchant.name}</h4>
              </div>

              {/* Package Card */}
              <Desk className="bg-primary-container/20 border-primary-container p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-on-surface">{adPackage.name}</span>
                  <span className="font-headline-md font-bold text-primary text-base">
                    Rp {adPackage.priceIdr.toLocaleString()}
                  </span>
                </div>
                <ul className="space-y-1 text-xs text-on-surface-variant">
                  <li className="flex items-center gap-1.5">
                    <Icon name="check" size={14} className="text-primary" /> Durasi promosi {adPackage.durationDays} hari
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Icon name="check" size={14} className="text-primary" /> Pin marker menyala dengan pita SPONSORED di peta
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Icon name="check" size={14} className="text-primary" /> Prioritas teratas di feed pencarian & rekomendasi
                  </li>
                </ul>
              </Desk>

              {/* Bank Transfer Info */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-on-surface">Transfer Pembayaran ke Rekening Resmi:</p>
                <div className="space-y-2">
                  {bankAccounts.map((b) => (
                    <div key={b.id} className="p-3 bg-white rounded-xl border border-outline-variant flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-on-surface">{b.bankName}</p>
                        <p className="text-sm font-mono text-on-surface font-semibold">{b.accountNumber}</p>
                        <p className="text-[11px] text-on-surface-variant">a.n. {b.accountHolder}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(b.id, b.accountNumber)}
                      >
                        {copiedBankId === b.id ? 'Tersalin!' : 'Salin'}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {promoteSuccess ? (
                <div className="bg-primary-container/30 border border-primary-container rounded-2xl p-4 text-center space-y-2">
                  <Icon name="check_circle" size={32} className="text-primary mx-auto" />
                  <h4 className="font-bold text-sm text-on-surface">Permintaan Promosi Terkirim</h4>
                  <p className="text-xs text-on-surface-variant">
                    Admin kami akan segera memverifikasi bukti transfer dan mengaktifkan status Sponsored usahamu dalam 1x24 jam.
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => setPromoteModalMerchant(null)}
                  >
                    Tutup
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 pt-2">
                  <p className="text-xs text-on-surface-variant text-center">
                    Setelah melakukan transfer, konfirmasikan aktivasi promosi ke tim support Jajal.in via WhatsApp.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="md"
                      className="flex-1"
                      onClick={() => setPromoteModalMerchant(null)}
                    >
                      Batal
                    </Button>
                    <Button
                      variant="primary"
                      size="md"
                      className="flex-1 font-bold"
                      onClick={() => {
                        const message = encodeURIComponent(
                          `Halo Tim Jajal.in, saya ingin mengaktifkan Open Promote untuk merchant "${promoteModalMerchant.name}" (ID: ${promoteModalMerchant.id}).`
                        );
                        window.open(`https://wa.me/6281234567890?text=${message}`, '_blank');
                        setPromoteSuccess(true);
                      }}
                    >
                      <Icon name="send" size={18} /> Konfirmasi Promosi
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
