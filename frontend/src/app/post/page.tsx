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
import Loading from '@/app/loading';
import { categories } from '@/lib/mock/regions';
import { contributionsApi, getAuthToken } from '@/lib/api-client';
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
  { label: 'Form Tempat' },
  { label: 'Submit' },
];

const formCategories = categories.filter((c) => c.applicableTo === 'both' || c.applicableTo === 'gem');

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

export default function PostPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [pageReady, setPageReady] = useState(false);
  const [step, setStep] = useState(0);
  const [agreed, setAgreed] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [lat, setLat] = useState<number>(-8.5069);
  const [lng, setLng] = useState<number>(115.2625);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Experience Highlights state
  const [highlights, setHighlights] = useState<{ title: string; description: string; icon: string }[]>([
    { title: '', description: '', icon: 'landscape' },
  ]);

  // Audio Story state (Opsional - disimpan di bucket audio-stories)
  const [audioTitle, setAudioTitle] = useState('');
  const [audioFileName, setAudioFileName] = useState('');

  useEffect(() => {
    if (!authLoading && !user && !getAuthToken()) {
      router.replace('/login?redirect=/post');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const t = setTimeout(() => setPageReady(true), 1000);
    return () => clearTimeout(t);
  }, []);

  if (authLoading || !pageReady || (!user && !getAuthToken())) {
    return (
      <div className="min-h-screen bg-background flex items-start justify-center pt-16 px-4">
        <Loading />
      </div>
    );
  }

  const canContinue = step === 0 ? agreed : name.trim() && category;

  const handleAddHighlight = () => {
    if (highlights.length < 3) {
      setHighlights((prev) => [...prev, { title: '', description: '', icon: 'star' }]);
    }
  };

  const handleRemoveHighlight = (idx: number) => {
    setHighlights((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleHighlightChange = (idx: number, field: 'title' | 'description' | 'icon', value: string) => {
    setHighlights((prev) =>
      prev.map((h, i) => (i === idx ? { ...h, [field]: value } : h))
    );
  };

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
  };

  const handleNext = async () => {
    if (!canContinue) return;
    if (step === 1) {
      const token = getAuthToken();
      if (!user && !token) {
        setSubmitError('Silakan masuk dengan Google terlebih dahulu untuk mengirim kontribusi.');
        return;
      }
      setSubmitting(true);
      setSubmitError('');
      try {
        await contributionsApi.create({
          name: name.trim(),
          description: description.trim(),
          lat: Number(lat),
          lng: Number(lng),
          regionId: '22222222-2222-2222-2222-222222222222',
          categoryId: category,
          media: images.length > 0 ? images : undefined,
          highlights: highlights.filter((h) => h.title.trim()),
        });
        setStep(2);
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : 'Gagal mengirim kontribusi');
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
      <TopAppBar variant="close" title="Tambah Kontribusi" />

      {/* Progress */}
      <div className="sticky top-16 z-30 bg-background border-b border-outline-variant px-margin-mobile md:px-margin-desktop py-4">
        <StepIndicator steps={steps} currentStep={step} />
      </div>

      <main className="flex-1 max-w-3xl mx-auto w-full px-margin-mobile md:px-margin-desktop py-lg pb-28">
        {step === 0 && (
          <section className="space-y-lg">
            <div>
              <h2 className="font-headline-md text-on-surface font-bold text-xl mb-1">Syarat & Ketentuan</h2>
              <p className="text-sm text-on-surface-variant">Sebelum berkontribusi, pastikan kamu memahami aturan komunitas kami.</p>
            </div>
            <div className="space-y-4 bg-white rounded-full border border-outline-variant p-lg">
              {[
                'Foto yang diunggah adalah hasil jepretan sendiri (bukan dari internet)',
                'Tempat yang diajukan adalah lokasi yang benar-benar ada dan pernah dikunjungi',
                'Deskripsi ditulis dengan jujur dan informatif',
                'Tidak mengandung unsur SARA, pornografi, atau promosi ilegal',
                'Kontribusi yang melanggar akan dihapus dan akun dapat dikenakan sanksi',
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
                      Silakan masuk dengan akun Google kamu untuk mengirim kontribusi tempat.
                    </p>
                  </div>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => router.push('/login?redirect=/post')}
                  className="w-full sm:w-auto shrink-0"
                >
                  Masuk dengan Google
                </Button>
              </div>
            )}

            <div>
              <h2 className="font-headline-md text-on-surface font-bold text-xl mb-1">Ceritakan pengalamanmu</h2>
              <p className="text-sm text-on-surface-variant">
                Bantu sesama penjelajah menemukan permata tersembunyi dengan detail yang akurat dan foto yang memukau.
              </p>
            </div>

            <Input label="Nama Tempat" placeholder="Contoh: Kopi Rimba, Ubud" value={name} onChange={(e) => setName(e.target.value)} />

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-on-surface">Kategori</label>
              <div className="flex flex-wrap gap-2">
                {formCategories.map((c) => (
                  <Chip key={c.id} active={category === c.id} onClick={() => setCategory(c.id)}>
                    {c.name}
                  </Chip>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-on-surface">Cerita Penjelajah</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Apa yang membuat tempat ini spesial?"
                rows={5}
                className="bg-white border border-outline-variant rounded-input px-4 py-3 text-base text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-2 focus:border-slate-heavy transition-all resize-none"
              />
            </div>

            {/* Experience Highlights (Opsional) */}
            <div className="space-y-3 pt-2 border-t border-outline-variant/40">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-semibold text-on-surface block">Experience Highlights (Opsional)</label>
                  <p className="text-xs text-on-surface-variant">Tambahkan keunikan khusus yang menjadi daya tarik utama tempat ini.</p>
                </div>
                {highlights.length < 3 && (
                  <button
                    type="button"
                    onClick={handleAddHighlight}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    <Icon name="add" size={16} /> Tambah Highlight
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {highlights.map((hl, idx) => (
                  <div key={idx} className="bg-white border border-outline-variant rounded-2xl p-3 space-y-2 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-primary">Highlight #{idx + 1}</span>
                      {highlights.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveHighlight(idx)}
                          className="text-xs text-error font-medium flex items-center gap-0.5 hover:underline"
                        >
                          <Icon name="delete" size={14} /> Hapus
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Judul (contoh: Vertical Descent)"
                        value={hl.title}
                        onChange={(e) => handleHighlightChange(idx, 'title', e.target.value)}
                        className="sm:col-span-2 bg-surface-dim/30 border border-outline-variant rounded-xl px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-slate-heavy"
                      />
                      <select
                        value={hl.icon}
                        onChange={(e) => handleHighlightChange(idx, 'icon', e.target.value)}
                        className="bg-surface-dim/30 border border-outline-variant rounded-xl px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-slate-heavy"
                      >
                        <option value="landscape">Landscape (Alam)</option>
                        <option value="light_mode">Light Mode (Cahaya)</option>
                        <option value="star">Star (Ikonis)</option>
                        <option value="water_drop">Water Drop (Air/Sungai)</option>
                        <option value="forest">Forest (Hutan)</option>
                      </select>
                    </div>
                    <textarea
                      placeholder="Deskripsi singkat highlight..."
                      value={hl.description}
                      onChange={(e) => handleHighlightChange(idx, 'description', e.target.value)}
                      rows={2}
                      className="w-full bg-surface-dim/30 border border-outline-variant rounded-xl px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-slate-heavy resize-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Audio Story (Opsional - simpan di bucket audio-stories) */}
            <div className="space-y-2 pt-2 border-t border-outline-variant/40">
              <label className="text-sm font-semibold text-on-surface block">Audio Cerita / Audio Story (Opsional)</label>
              <p className="text-xs text-on-surface-variant">
                Unggah berkas rekaman suara cerita/narasi lokal (akan disimpan di bucket <code>audio-stories</code>).
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Judul Audio Cerita (contoh: Legenda Gua)"
                  value={audioTitle}
                  onChange={(e) => setAudioTitle(e.target.value)}
                  className="bg-white border border-outline-variant rounded-xl px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-slate-heavy"
                />
                <label className="border border-dashed border-outline-variant bg-white rounded-xl px-3 py-2 flex items-center justify-between cursor-pointer hover:border-primary">
                  <span className="text-xs text-on-surface-variant truncate">
                    {audioFileName || 'Pilih berkas MP3/Audio...'}
                  </span>
                  <Icon name="graphic_eq" size={20} className="text-primary shrink-0" />
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setAudioFileName(file.name);
                    }}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Media Upload */}
            <div>
              <label className="text-sm font-semibold text-on-surface mb-2 block">Foto & Video (Maks 10)</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-outline-variant group">
                    <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-error transition-colors"
                      title="Hapus foto"
                    >
                      <Icon name="close" size={16} />
                    </button>
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

            {/* Location & Interactive Picker */}
            <div className="space-y-3 pt-2 border-t border-outline-variant/40">
              <div>
                <label className="text-sm font-semibold text-on-surface block">Lokasi Presisi Tempat</label>
                <p className="text-xs text-on-surface-variant mb-2">
                  Cari lokasi/alamat, geser pin di peta, atau tekan tombol GPS untuk menentukan posisi secara akurat.
                </p>
              </div>
              <LocationPicker
                lat={lat}
                lng={lng}
                onChange={(newLat, newLng) => {
                  setLat(newLat);
                  setLng(newLng);
                }}
              />
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
              <Icon name="check" size={48} className="text-on-primary-container" />
            </div>
            <div>
              <h2 className="font-headline-md text-on-surface font-bold text-2xl mb-2">Kontribusi Terkirim!</h2>
              <p className="text-on-surface-variant">
                Terima kasih! Tim Jajal.in akan meninjau kontribusimu dalam 1x24 jam.
              </p>
            </div>
            <div className="bg-white rounded-full border border-outline-variant p-lg max-w-sm mx-auto">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary-container/30 flex items-center justify-center">
                  <Icon name="stars" size={24} className="text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-on-surface">Potensi +50 XP</p>
                  <p className="text-xs text-on-surface-variant">Jika disetujui Admin</p>
                </div>
              </div>
            </div>
            <Button variant="primary" size="lg" onClick={() => router.push('/')}>
              Kembali ke Explore
            </Button>
          </section>
        )}

        {/* Action Bar (Scrolls with page content, above BottomNav) */}
        {step < 2 && (
          <div className="mt-xl pt-lg border-t border-outline-variant flex justify-between items-center">
            <Button variant="ghost" onClick={handleBack}>
              <Icon name="arrow_back" size={20} /> Kembali
            </Button>
            <Button variant="primary" onClick={handleNext} disabled={!canContinue || submitting}>
              {submitting ? 'Mengirim...' : step === 0 ? 'Lanjut' : 'Kirim Kontribusi'} {!submitting && <Icon name="arrow_forward" size={20} />}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
