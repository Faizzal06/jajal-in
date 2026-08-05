'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TopAppBar from '@/components/layout/TopAppBar';
import Icon from '@/components/ui/Icon';
import Button from '@/components/ui/Button';
import Chip from '@/components/ui/Chip';
import Input from '@/components/ui/Input';
import StepIndicator from '@/components/ui/StepIndicator';
import Card from '@/components/ui/Card';
import MapStatic from '@/components/ui/MapStatic';
import { categories } from '@/lib/mock/regions';
import { bankAccounts, adPackages } from '@/lib/mock/merchants';
import { merchantApi, getAuthToken } from '@/lib/api-client';
import { useAuth } from '@/lib/context/AuthContext';

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
  const [products, setProducts] = useState<ProductItem[]>([
    { id: '1', name: '', price: '', description: '' },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

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
                'Bersedia mengikuti kode etik UMKM TemuLokal',
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

            <div>
              <label className="text-sm font-semibold text-on-surface mb-2 block">Lokasi Usaha</label>
              <MapStatic lat={-7.8014} lng={110.3644} label="Yogyakarta, ID" height="h-40" />
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
              <h3 className="font-bold text-on-surface mb-3">Transfer ke Rekening TemuLokal</h3>
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
                    lat: -7.8014,
                    lng: 110.3644,
                    regionId: 'r2',
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
