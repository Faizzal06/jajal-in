'use client';

import { useState, useEffect, ChangeEvent } from 'react';
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
  { label: 'Form Usaha' },
  { label: 'Submit' },
];

const merchantCategories = categories.filter((c) => c.applicableTo === 'both' || c.applicableTo === 'merchant');

const compressImage = (file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.8): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
};

interface ProductItem {
  id: string;
  name: string;
  price: string;
  description: string;
  image?: string;
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
  const [images, setImages] = useState<string[]>([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState<number>(0);
  const [lat, setLat] = useState<number>(-7.8014);
  const [lng, setLng] = useState<number>(110.3644);
  const [regionsGrouped, setRegionsGrouped] = useState<RegionResponse[]>([]);
  const [allRegencies, setAllRegencies] = useState<RegionResponse[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<string>('');
  const [detectedRegionName, setDetectedRegionName] = useState<string>('');
  const [products, setProducts] = useState<ProductItem[]>([]);
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

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileList = Array.from(files);
    for (const file of fileList) {
      const compressed = await compressImage(file);
      if (compressed) {
        setImages((prev) => (prev.length < 10 ? [...prev, compressed] : prev));
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPrimaryImageIndex((prev) => {
      if (prev === index) return 0;
      if (prev > index) return prev - 1;
      return prev;
    });
  };

  const addProduct = () => {
    setProducts([...products, { id: String(Date.now()), name: '', price: '', description: '', image: '' }]);
  };

  const updateProduct = (id: string, field: keyof ProductItem, value: string) => {
    setProducts(products.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const handleProductImageUpload = async (id: string, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImage(file, 800, 800, 0.7);
    if (compressed) {
      updateProduct(id, 'image', compressed);
    }
  };

  const removeProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  const canContinue =
    step === 0 ? agreed
    : step === 1 ? businessName.trim() && category
    : true;

  const handleNext = async () => {
    if (!canContinue) return;
    if (step === 1) {
      const token = getAuthToken();
      if (!user && !token) {
        setSubmitError('Silakan masuk dengan Google terlebih dahulu untuk mendaftarkan usaha.');
        return;
      }
      setSubmitting(true);
      setSubmitError('');
      try {
        const validPrimaryIndex = primaryImageIndex < images.length ? primaryImageIndex : 0;
        const orderedMedia = images.length > 0
          ? [images[validPrimaryIndex], ...images.filter((_, i) => i !== validPrimaryIndex)]
          : undefined;

        const validProducts = products
          .filter((p) => p.name.trim())
          .map((p) => ({
            name: p.name.trim(),
            price: Number(p.price) || 0,
            description: p.description.trim(),
            imageUrl: p.image || undefined,
          }));

        await merchantApi.register({
          name: businessName.trim(),
          description: description.trim(),
          lat: Number(lat),
          lng: Number(lng),
          regionId: selectedRegionId || (allRegencies[0]?.id ?? '11111111-1111-1111-1111-111111111111'),
          categoryId: category,
          contactWhatsApp: whatsapp.trim(),
          media: orderedMedia,
          products: validProducts.length > 0 ? validProducts : undefined,
        });

        setStep(2);
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : 'Gagal mendaftarkan usaha');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (step < 2) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
    else router.back();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopAppBar variant="close" title="Daftarkan UMKM" />

      {/* Progress Stepper */}
      <div className="sticky top-16 z-30 bg-background border-b border-outline-variant px-margin-mobile md:px-margin-desktop py-4">
        <StepIndicator steps={steps} currentStep={step} />
      </div>

      <main className="flex-1 max-w-3xl mx-auto w-full px-margin-mobile md:px-margin-desktop py-lg pb-28">
        {step === 0 && (
          <section className="space-y-lg">
            <div>
              <h2 className="font-headline-md text-on-surface font-bold text-xl mb-1">Syarat & Ketentuan UMKM</h2>
              <p className="text-sm text-on-surface-variant">
                Daftarkan usaha kuliner, kerajinan, fashion, atau oleh-oleh lokal Anda secara gratis dan jangkau lebih banyak penjelajah.
              </p>
            </div>

            {/* Free Registration Callout */}
            <div className="bg-primary-container/20 border border-primary-container rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center shrink-0">
                <Icon name="verified" size={24} className="text-on-primary-container" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-on-surface">Pendaftaran 100% Gratis</h4>
                <p className="text-xs text-on-surface-variant">
                  Daftarkan profil gerai/toko dan katalog produk tanpa biaya. Anda juga dapat mengaktifkan fitur promosi berbayar (Open Promote) kapan saja setelah terdaftar.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-full border border-outline-variant p-lg space-y-4">
              <h3 className="font-bold text-on-surface">Aturan Pendaftaran UMKM</h3>
              {[
                'Usaha yang didaftarkan adalah milik sendiri atau memiliki izin pengelolaan resmi',
                'Informasi alamat, nomor kontak, dan jam operasional adalah benar dan akurat',
                'Foto yang diunggah asli mencerminkan lokasi fisik, suasana, atau produk toko Anda',
                'Harga dan ketersediaan produk yang dicantumkan sesuai dengan kondisi nyata',
                'Bersedia menjaga integritas dan mengikuti kode etik komunitas UMKM Jajal.in',
              ].map((rule, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Icon name="check_circle" size={20} className="text-primary-container mt-0.5 shrink-0" />
                  <span className="text-sm text-on-surface-variant">{rule}</span>
                </div>
              ))}
            </div>

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
              <h2 className="font-headline-md text-on-surface font-bold text-xl mb-1">Profil & Detail Usaha</h2>
              <p className="text-sm text-on-surface-variant">
                Lengkapi informasi gerai, foto tempat, katalog produk, dan koordinat lokasi untuk memudahkan traveler menemukan usahamu.
              </p>
            </div>

            <Input
              label="Nama Usaha / Toko"
              placeholder="Contoh: Batik Tulis Sekar Jagad"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-on-surface">Kategori Usaha</label>
              <div className="flex flex-wrap gap-2">
                {merchantCategories.map((c) => (
                  <Chip key={c.id} active={category === c.id} onClick={() => setCategory(c.id)}>
                    {c.name}
                  </Chip>
                ))}
              </div>
            </div>

            <Input
              label="Nomor WhatsApp Usaha"
              placeholder="Contoh: 081234567890 / 6281234567890"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              type="tel"
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-on-surface">Deskripsi & Cerita Usaha</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ceritakan tentang sejarah, keunikan, produk unggulan, atau suasana toko Anda..."
                rows={4}
                className="bg-white border border-outline-variant rounded-input px-4 py-3 text-base text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-2 focus:border-slate-heavy transition-all resize-none"
              />
            </div>

            {/* Media Upload (Photos) */}
            <div className="space-y-2 pt-2 border-t border-outline-variant/40">
              <label className="text-sm font-semibold text-on-surface block">Foto Tempat & Suasana Usaha (Maks 10)</label>
              <p className="text-xs text-on-surface-variant mb-2">
                Unggah foto fisik gerai, etalase, atau suasana toko. Pin foto terbaik untuk dijadikan foto sampul utama.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className={`relative aspect-square rounded-xl overflow-hidden group transition-all ${
                      idx === primaryImageIndex ? 'border-2 border-primary' : 'border border-outline-variant'
                    }`}
                  >
                    <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPrimaryImageIndex(idx)}
                      className={`absolute top-1 left-1 rounded-full p-1 transition-colors ${
                        idx === primaryImageIndex
                          ? 'bg-primary text-on-primary'
                          : 'bg-black/60 text-white hover:bg-black/80'
                      }`}
                      title="Jadikan Foto Utama"
                    >
                      <Icon name="push_pin" size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-error transition-colors"
                      title="Hapus foto"
                    >
                      <Icon name="close" size={16} />
                    </button>
                    {idx === primaryImageIndex && (
                      <div className="absolute bottom-1.5 left-1.5 z-10 bg-primary-container text-on-primary-container font-bold text-xs px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                        <Icon name="push_pin" size={12} />
                        <span>Foto Utama</span>
                      </div>
                    )}
                  </div>
                ))}
                {images.length < 10 && (
                  <label className="border-2 border-dashed border-outline-variant rounded-xl aspect-square flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-primary-container transition-colors bg-white/50">
                    <Icon name="add_a_photo" size={32} className="text-outline-variant" />
                    <span className="text-xs text-on-surface-variant font-medium">+ Tambah Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Product Catalog Repeater (Opsional) */}
            <div className="space-y-3 pt-2 border-t border-outline-variant/40">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-semibold text-on-surface block">Katalog Produk Unggulan (Opsional)</label>
                  <p className="text-xs text-on-surface-variant">Tambahkan produk atau menu andalan yang dijual di toko Anda.</p>
                </div>
                <button
                  type="button"
                  onClick={addProduct}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  <Icon name="add" size={16} /> Tambah Produk
                </button>
              </div>

              {products.length === 0 && (
                <div className="bg-surface-dim/30 border border-dashed border-outline-variant rounded-2xl p-4 text-center">
                  <Icon name="inventory_2" size={28} className="text-outline-variant mx-auto mb-1" />
                  <p className="text-xs text-on-surface-variant mb-2">Belum ada produk yang ditambahkan.</p>
                  <Button variant="ghost" size="sm" onClick={addProduct}>
                    <Icon name="add" size={16} /> Tambah Produk Pertama
                  </Button>
                </div>
              )}

              <div className="space-y-4">
                {products.map((product, idx) => (
                  <Card key={product.id} className="space-y-3 relative">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm text-on-surface flex items-center gap-1.5">
                        <Icon name="shopping_bag" size={16} className="text-primary" />
                        Produk #{idx + 1}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeProduct(product.id)}
                        className="text-error text-xs font-medium hover:underline flex items-center gap-0.5"
                      >
                        <Icon name="delete" size={14} /> Hapus
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Product Image upload */}
                      <div className="sm:col-span-1">
                        <label className="border-2 border-dashed border-outline-variant rounded-xl h-28 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors overflow-hidden relative bg-surface-dim/20">
                          {product.image ? (
                            <>
                              <img src={product.image} alt={product.name || 'Produk'} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium">
                                Ganti Foto
                              </div>
                            </>
                          ) : (
                            <div className="text-center p-2">
                              <Icon name="add_photo_alternate" size={22} className="text-outline-variant mb-1" />
                              <p className="text-[11px] text-on-surface-variant font-medium">Foto Produk</p>
                            </div>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleProductImageUpload(product.id, e)}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* Product Info */}
                      <div className="sm:col-span-2 space-y-2">
                        <Input
                          placeholder="Nama Produk (contoh: Nasi Megono Komplit)"
                          value={product.name}
                          onChange={(e) => updateProduct(product.id, 'name', e.target.value)}
                        />
                        <Input
                          placeholder="Harga (Rp)"
                          type="number"
                          value={product.price}
                          onChange={(e) => updateProduct(product.id, 'price', e.target.value)}
                        />
                      </div>
                    </div>

                    <textarea
                      placeholder="Deskripsi singkat produk..."
                      value={product.description}
                      onChange={(e) => updateProduct(product.id, 'description', e.target.value)}
                      rows={2}
                      className="w-full bg-surface-dim/30 border border-outline-variant rounded-input px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-2 focus:border-slate-heavy transition-all resize-none"
                    />
                  </Card>
                ))}
              </div>

              {products.length > 0 && (
                <div className="text-center pt-1">
                  <Button variant="ghost" size="sm" onClick={addProduct}>
                    <Icon name="add" size={16} /> Tambah Produk Lain
                  </Button>
                </div>
              )}
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

            {submitError && (
              <div className="bg-error/10 border border-error text-error text-sm rounded-xl px-4 py-3">
                {submitError}
              </div>
            )}
          </section>
        )}

        {step === 2 && (
          <section className="text-center space-y-lg py-xl">
            <div className="w-24 h-24 rounded-full bg-primary-container mx-auto flex items-center justify-center animate-bounce">
              <Icon name="storefront" size={48} className="text-on-primary-container" />
            </div>
            <div>
              <h2 className="font-headline-md text-on-surface font-bold text-2xl mb-2">Pendaftaran UMKM Terkirim!</h2>
              <p className="text-on-surface-variant max-w-md mx-auto">
                Terima kasih telah mendaftarkan usahamu di Jajal.in. Tim kurator kami akan memverifikasi usahamu dalam 1x24 jam.
              </p>
            </div>

            <div className="bg-white rounded-full border border-outline-variant p-lg max-w-sm mx-auto space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary-container/30 flex items-center justify-center shrink-0">
                  <Icon name="stars" size={24} className="text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-on-surface">Potensi +50 XP</p>
                  <p className="text-xs text-on-surface-variant">Setelah diverifikasi Admin</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button variant="primary" size="lg" onClick={() => router.push('/profile')}>
                <Icon name="person" size={20} /> Lihat Profil & Kelola Merchant
              </Button>
              <Button variant="ghost" size="lg" onClick={() => router.push('/')}>
                Kembali ke Explore
              </Button>
            </div>
          </section>
        )}

        {/* Action Bar */}
        {step < 2 && (
          <div className="mt-xl pt-lg border-t border-outline-variant flex justify-between items-center">
            <Button variant="ghost" onClick={handleBack}>
              <Icon name="arrow_back" size={20} /> Kembali
            </Button>
            <Button variant="primary" onClick={handleNext} disabled={!canContinue || submitting}>
              {submitting ? 'Mengirim...' : step === 0 ? 'Lanjut' : 'Kirim Pendaftaran'} {!submitting && <Icon name="arrow_forward" size={20} />}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
