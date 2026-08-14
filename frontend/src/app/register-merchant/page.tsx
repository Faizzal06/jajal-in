'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import TopAppBar from '@/components/layout/TopAppBar';
import Icon from '@/components/ui/Icon';
import Button from '@/components/ui/Button';
import Chip from '@/components/ui/Chip';
import Input from '@/components/ui/Input';
import StepIndicator from '@/components/ui/StepIndicator';
import Card from '@/components/ui/Card';
import { categories } from '@/lib/mock/regions';
import { bankAccounts, adPackages } from '@/lib/mock/merchants';
import { merchantApi, regionsApi, RegionResponse, getAuthToken } from '@/lib/api-client';
import { useAuth } from '@/lib/context/AuthContext';

const LocationPicker = dynamic(() => import('@/components/map/LocationPicker'), {
  ssr: false,
  loading: () => (
    <div className="h-64 sm:h-80 bg-surface-dim/40 rounded-2xl border border-outline-variant animate-pulse flex flex-col items-center justify-center gap-2 text-on-surface-variant">
      <Icon name="map" size={32} className="text-outline-variant animate-bounce" />
      <span className="text-xs font-medium">Memuat Peta Interaktif...</span>
    </div>
  ),
});

const steps = [
  { label: 'Syarat & Ketentuan' },
  { label: 'Profil Usaha' },
  { label: 'Katalog Produk' },
  { label: 'Submit & Bayar' },
];

const merchantCategories = categories.filter((c) => c.applicableTo === 'both' || c.applicableTo === 'merchant');

interface ProductItem {
  id: string;
  name: string;
  price: string;
  description: string;
}

export default function RegisterMerchantPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [agreed, setAgreed] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [description, setDescription] = useState('');
  const [lat, setLat] = useState<number>(-7.8014);
  const [lng, setLng] = useState<number>(110.3644);
  const [regionsGrouped, setRegionsGrouped] = useState<RegionResponse[]>([]);
  const [allRegencies, setAllRegencies] = useState<RegionResponse[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<string>('');
  const [detectedRegionName, setDetectedRegionName] = useState<string>('');
  const [products, setProducts] = useState<ProductItem[]>([
    { id: '1', name: '', price: '', description: '' },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    regionsApi
      .getGrouped()
      .then((data) => {
        setRegionsGrouped(data);
        const regList: RegionResponse[] = [];
        data.forEach((prov) => {
          if (prov.regencies) {
            regList.push(...prov.regencies);
          }
        });
        setAllRegencies(regList);
      })
      .catch(() => {});
  }, []);

  const addProduct = () => {
    setProducts([...products, { id: String(Date.now()), name: '', price: '', description: '' }]);
  };

  const updateProduct = (id: string, field: keyof ProductItem, value: string) => {
    setProducts(products.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const removeProduct = (id: string) => {
    if (products.length > 1) setProducts(products.filter((p) => p.id !== id));
  };

  const canContinue =
    step === 0 ? agreed
    : step === 1 ? businessName.trim() && category
    : step === 2 ? products.some((p) => p.name.trim())
    : true;

  const handleNext = () => {
    if (!canContinue) return;
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
    else router.back();
  };

  const adPackage = adPackages[0];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopAppBar variant="close" title="Daftarkan UMKM" />

      <div className="sticky top-16 z-30 bg-background border-b border-outline-variant px-margin-mobile md:px-margin-desktop py-4">
        <StepIndicator steps={steps} currentStep={step} />
      </div>

      <main className="flex-1 max-w-3xl mx-auto w-full px-margin-mobile md:px-margin-desktop py-lg">
        {step === 0 && (
          <section className="space-y-lg">
            <div>
              <h2 className="font-headline-md text-on-surface font-bold text-xl mb-1">Syarat & Ketentuan</h2>
              <p className="text-sm text-on-surface-variant">Daftarkan usaha Anda dan jangkau lebih banyak traveler.</p>
            </div>

            <div className="bg-white rounded-full border border-outline-variant p-lg space-y-4">
              <h3 className="font-bold text-on-surface">Aturan Pendaftaran</h3>
              {[
                'Usaha yang didaftarkan adalah milik sendiri atau memiliki izin pengelolaan',
                'Informasi yang diberikan adalah benar dan akurat',
                'Produk yang ditampilkan sesuai dengan ketersediaan',
                'Bersedia mengikuti kode etik UMKM Jajal.in',
              ].map((rule, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Icon name="check_circle" size={20} className="text-primary-container mt-0.5 shrink-0" />
                  <span className="text-sm text-on-surface-variant">{rule}</span>
                </div>
              ))}
            </div>

            <Card className="bg-primary-container/20 border-primary-container">
              <h3 className="font-bold text-on-surface mb-2">Paket Promosi</h3>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-on-surface">{adPackage.name}</span>
                <span className="font-headline-md font-bold text-primary">
                  Rp {adPackage.priceIdr.toLocaleString()}
                </span>
              </div>
              <ul className="space-y-1 text-sm text-on-surface-variant">
                <li className="flex items-center gap-2">
                  <Icon name="check" size={16} className="text-primary" /> Durasi {adPackage.durationDays} hari
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="check" size={16} className="text-primary" /> Pin marker menyala dengan pita SPONSORED
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="check" size={16} className="text-primary" /> Prioritas di feed pencarian & carousel
                </li>
              </ul>
            </Card>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-5 h-5 rounded border-outline-variant accent-primary-container"
              />
              <span className="text-sm font-medium text-on-surface">Saya menyetujui syarat dan ketentuan di atas</span>
            </label>
          </section>
        )}

        {step === 1 && (
          <section className="space-y-lg">
            <div>
              <h2 className="font-headline-md text-on-surface font-bold text-xl mb-1">Profil Usaha</h2>
              <p className="text-sm text-on-surface-variant">Lengkapi informasi usaha Anda.</p>
            </div>

            <Input
              label="Nama Usaha"
              placeholder="Contoh: Warung Makan Bu Ani"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-on-surface">Kategori</label>
              <div className="flex flex-wrap gap-2">
                {merchantCategories.map((c) => (
                  <Chip key={c.id} active={category === c.id} onClick={() => setCategory(c.id)}>
                    {c.name}
                  </Chip>
                ))}
              </div>
            </div>

            <Input
              label="Nomor WhatsApp"
              placeholder="Contoh: 6281234567890"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              type="tel"
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-on-surface">Deskripsi Usaha</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ceritakan tentang usaha Anda..."
                rows={4}
                className="bg-white border border-outline-variant rounded-input px-4 py-3 text-base text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-2 focus:border-slate-heavy transition-all resize-none"
              />
            </div>

            {/* Location & Interactive Picker */}
            <div className="space-y-3 pt-2 border-t border-outline-variant/40">
              <div>
                <label className="text-sm font-semibold text-on-surface block">Lokasi Presisi Usaha</label>
                <p className="text-xs text-on-surface-variant mb-2">
                  Cari lokasi/alamat, geser pin di peta, atau gunakan GPS untuk menandai lokasi gerai/toko Anda.
                </p>
              </div>
              <LocationPicker
                lat={lat}
                lng={lng}
                onChange={(newLat, newLng) => {
                  setLat(newLat);
                  setLng(newLng);
                }}
                onAddressChange={(info) => {
                  if (info.cityOrRegency && allRegencies.length > 0) {
                    const searchTarget = info.cityOrRegency.toLowerCase().replace(/^(kabupaten|kota)\s+/i, '').trim();
                    const matched = allRegencies.find((r) => {
                      const regNameClean = r.name.toLowerCase().replace(/^(kabupaten|kota)\s+/i, '').trim();
                      return regNameClean === searchTarget || regNameClean.includes(searchTarget) || searchTarget.includes(regNameClean);
                    });
                    if (matched) {
                      setSelectedRegionId(matched.id);
                      setDetectedRegionName(matched.name);
                    }
                  }
                }}
              />

              {/* Region / Kabupaten / Kota Selection */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-on-surface">Wilayah (Kabupaten / Kota)</label>
                  {detectedRegionName && (
                    <span className="text-[11px] font-medium bg-primary-container/40 text-on-surface border border-primary-container px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Icon name="check_circle" size={14} className="text-primary" /> Terdeteksi: {detectedRegionName}
                    </span>
                  )}
                </div>
                <select
                  value={selectedRegionId}
                  onChange={(e) => {
                    setSelectedRegionId(e.target.value);
                    const sel = allRegencies.find((r) => r.id === e.target.value);
                    if (sel) setDetectedRegionName(sel.name);
                  }}
                  className="w-full bg-white border border-outline-variant rounded-xl px-3.5 py-2.5 text-sm text-on-surface focus:outline-none focus:border-2 focus:border-slate-heavy transition-all"
                >
                  <option value="">-- Pilih Kabupaten / Kota --</option>
                  {regionsGrouped.map((prov) => (
                    <optgroup key={prov.id} label={prov.name}>
                      {(prov.regencies || []).map((reg) => (
                        <option key={reg.id} value={reg.id}>
                          {reg.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <p className="text-xs text-on-surface-variant">
                  Wilayah terdeteksi otomatis saat Anda memilih titik di peta. Anda juga dapat memilihnya secara manual jika diperlukan.
                </p>
              </div>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="space-y-lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-headline-md text-on-surface font-bold text-xl mb-1">Katalog Produk</h2>
                <p className="text-sm text-on-surface-variant">Tambahkan produk unggulan usaha Anda.</p>
              </div>
              <Button variant="ghost" size="sm" onClick={addProduct}>
                <Icon name="add" size={16} /> Tambah
              </Button>
            </div>

            {products.map((product) => (
              <Card key={product.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm text-on-surface">Produk {product.id === '1' ? 'Utama' : `#${products.indexOf(product) + 1}`}</h4>
                  {products.length > 1 && (
                    <button onClick={() => removeProduct(product.id)} className="text-error text-sm hover:underline">
                      Hapus
                    </button>
                  )}
                </div>
                <div className="h-24 bg-surface-dim rounded-xl flex items-center justify-center border-2 border-dashed border-outline-variant cursor-pointer">
                  <div className="text-center">
                    <Icon name="add_photo_alternate" size={24} className="text-outline-variant" />
                    <p className="text-xs text-on-surface-variant mt-1">Foto Produk</p>
                  </div>
                </div>
                <Input
                  placeholder="Nama Produk"
                  value={product.name}
                  onChange={(e) => updateProduct(product.id, 'name', e.target.value)}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Harga (Rp)"
                    type="number"
                    value={product.price}
                    onChange={(e) => updateProduct(product.id, 'price', e.target.value)}
                  />
                  <Input
                    placeholder="Kategori Produk"
                    value={product.description.split(' ').slice(0, 3).join(' ')}
                    onChange={() => {}}
                  />
                </div>
                <textarea
                  placeholder="Deskripsi produk..."
                  value={product.description}
                  onChange={(e) => updateProduct(product.id, 'description', e.target.value)}
                  rows={2}
                  className="w-full bg-white border border-outline-variant rounded-input px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-2 focus:border-slate-heavy transition-all resize-none"
                />
              </Card>
            ))}

            <div className="text-center">
              <Button variant="ghost" size="sm" onClick={addProduct}>
                <Icon name="add" size={16} /> Tambah Produk Lain
              </Button>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="space-y-lg">
            {!user && (
              <div className="bg-primary-container/20 border border-primary-container rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Icon name="lock" size={24} className="text-primary shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm text-on-surface">Masuk dengan Google</h4>
                    <p className="text-xs text-on-surface-variant">
                      Silakan masuk dengan akun Google kamu sebelum mendaftarkan usaha.
                    </p>
                  </div>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => router.push('/login?redirect=/register-merchant')}
                  className="w-full sm:w-auto shrink-0"
                >
                  Masuk dengan Google
                </Button>
              </div>
            )}

            <div>
              <h2 className="font-headline-md text-on-surface font-bold text-xl mb-1">Konfirmasi & Pembayaran</h2>
              <p className="text-sm text-on-surface-variant">Review data dan lakukan pembayaran untuk mengaktifkan iklan.</p>
            </div>

            {/* Ringkasan */}
            <Card className="space-y-3">
              <h3 className="font-bold text-on-surface">Ringkasan Pendaftaran</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Nama Usaha</span>
                  <span className="font-medium text-on-surface">{businessName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Kategori</span>
                  <span className="font-medium text-on-surface">
                    {merchantCategories.find((c) => c.id === category)?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">WhatsApp</span>
                  <span className="font-medium text-on-surface">{whatsapp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Jumlah Produk</span>
                  <span className="font-medium text-on-surface">{products.filter((p) => p.name.trim()).length}</span>
                </div>
              </div>
            </Card>

            {/* Tagihan */}
            <Card className="border-primary-container">
              <h3 className="font-bold text-on-surface mb-3">Rincian Tagihan</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">{adPackage.name} ({adPackage.durationDays} Hari)</span>
                  <span className="font-medium text-on-surface">Rp {adPackage.priceIdr.toLocaleString()}</span>
                </div>
                <hr className="border-outline-variant" />
                <div className="flex justify-between font-bold text-base">
                  <span>Total Pembayaran</span>
                  <span className="text-primary">Rp {adPackage.priceIdr.toLocaleString()}</span>
                </div>
              </div>
            </Card>

            {/* Bank Accounts */}
            <div>
              <h3 className="font-bold text-on-surface mb-3">Transfer ke Rekening Jajal.in</h3>
              <div className="space-y-3">
                {bankAccounts.map((bank) => (
                  <Card key={bank.id} className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary-container/20 flex items-center justify-center shrink-0">
                      <Icon name="account_balance" size={24} className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm text-on-surface">{bank.bankName}</p>
                      <p className="text-sm text-on-surface-variant">{bank.accountNumber}</p>
                      <p className="text-xs text-on-surface-variant/70">a.n. {bank.accountHolder}</p>
                    </div>
                    <button className="text-xs text-primary font-medium hover:underline" onClick={() => navigator.clipboard.writeText(bank.accountNumber)}>
                      Salin
                    </button>
                  </Card>
                ))}
              </div>
            </div>

            {/* Upload Proof */}
            <Card className="border-dashed border-outline-variant text-center border-2">
              <Icon name="cloud_upload" size={40} className="text-outline-variant mb-2" />
              <p className="font-medium text-sm text-on-surface mb-1">Upload Bukti Transfer</p>
              <p className="text-xs text-on-surface-variant">Screenshot atau foto bukti pembayaran</p>
            </Card>

            <p className="text-xs text-on-surface-variant text-center">
              Setelah pembayaran diverifikasi, status akan menjadi Pending Approval hingga Admin memverifikasi usaha Anda.
            </p>

            {submitError && (
              <div className="bg-error/10 border border-error text-error text-sm rounded-xl px-4 py-3">
                {submitError}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Action Bar */}
      <div className="sticky bottom-0 bg-background border-t border-outline-variant px-margin-mobile md:px-margin-desktop py-4">
        <div className="max-w-3xl mx-auto flex justify-between">
          <Button variant="ghost" onClick={handleBack}>
            <Icon name="arrow_back" size={20} /> Kembali
          </Button>
          {step < 3 ? (
            <Button variant="primary" onClick={handleNext} disabled={!canContinue}>
              Lanjut <Icon name="arrow_forward" size={20} />
            </Button>
          ) : (
            <Button
              variant="primary"
              disabled={submitting}
              onClick={async () => {
                const token = getAuthToken();
                if (!user && !token) {
                  setSubmitError('Silakan masuk dengan Google terlebih dahulu.');
                  return;
                }
                setSubmitting(true);
                setSubmitError('');
                try {
                  await merchantApi.register({
                    name: businessName.trim(),
                    description: description.trim(),
                    lat: Number(lat),
                    lng: Number(lng),
                    regionId: selectedRegionId || (allRegencies[0]?.id ?? '11111111-1111-1111-1111-111111111111'),
                    categoryId: category,
                    contactWhatsApp: whatsapp.trim(),
                    products: products
                      .filter((p) => p.name.trim())
                      .map((p) => ({
                        name: p.name.trim(),
                        price: Number(p.price) || 0,
                        description: p.description.trim(),
                      })),
                    adPackageId: adPackages[0]?.id,
                  });
                  router.push('/');
                } catch (err) {
                  setSubmitError(err instanceof Error ? err.message : 'Gagal mendaftarkan usaha');
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {submitting ? 'Mengirim...' : 'Kirim Pendaftaran'} {!submitting && <Icon name="check" size={20} />}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
