'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { adminApi, HeroSettings } from '@/lib/api-client';
import Icon from '@/components/ui/Icon';
import Button from '@/components/ui/Button';
import Chip from '@/components/ui/Chip';

const DEFAULT_HERO: HeroSettings = {
  hero_badge: 'Vivid Explorer Mode',
  hero_title: 'Radar UMKM',
  hero_subtitle: 'Temukan permata tersembunyi dan produk lokal terbaik di sekitarmu dengan presisi tinggi.',
  hero_image_url: '',
};

export default function AdminHeroPage() {
  const [formData, setFormData] = useState<HeroSettings>(DEFAULT_HERO);
  const [initialData, setInitialData] = useState<HeroSettings>(DEFAULT_HERO);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getHeroSettings();
      setFormData(data);
      setInitialData(data);
    } catch (err: unknown) {
      setMessage({
        type: 'error',
        text: (err as Error).message || 'Gagal memuat pengaturan hero banner.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof HeroSettings, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Ukuran file maksimal 5MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        handleInputChange('hero_image_url', reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage(null);
      const updated = await adminApi.updateHeroSettings(formData);
      setFormData(updated);
      setInitialData(updated);
      setMessage({ type: 'success', text: 'Pengaturan hero banner berhasil disimpan!' });
    } catch (err: unknown) {
      setMessage({
        type: 'error',
        text: (err as Error).message || 'Gagal menyimpan pengaturan hero banner.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setFormData(DEFAULT_HERO);
  };

  const handleRevert = () => {
    setFormData(initialData);
    setMessage(null);
  };

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialData);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse max-w-4xl">
        <div className="h-8 w-64 bg-gray-200 rounded" />
        <div className="h-4 w-96 bg-gray-200 rounded" />
        <div className="h-96 bg-white rounded-full border border-light-gray" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-container/30 text-on-primary-container rounded-xl">
            <Icon name="view_carousel" size={24} />
          </div>
          <div>
            <h1 className="font-headline text-2xl font-bold text-slate-heavy">Pengaturan Hero Banner</h1>
            <p className="text-on-surface-variant text-sm mt-0.5">
              Atur banner utama yang muncul di bagian atas halaman beranda jajal.in
            </p>
          </div>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <Icon
            name={message.type === 'success' ? 'check_circle' : 'error'}
            size={20}
            className={message.type === 'success' ? 'text-green-600' : 'text-red-600'}
          />
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      {/* Live Preview Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-slate-heavy flex items-center gap-2">
            <Icon name="visibility" size={18} />
            Live Preview
          </label>
          <span className="text-xs text-on-surface-variant">Tampilan langsung di halaman utama</span>
        </div>

        <div className="relative rounded-full overflow-hidden h-64 md:h-80 bg-gradient-to-br from-primary-container/20 to-primary/10 border border-outline-variant shadow-sm">
          {formData.hero_image_url ? (
            <img
              src={formData.hero_image_url}
              alt="Hero Background Preview"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center opacity-40">
              <Icon name="image" size={96} className="text-primary" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />

          <div className="relative z-10 flex flex-col justify-end h-full p-lg md:p-xl">
            {formData.hero_badge && (
              <Chip active className="w-fit mb-3 text-xs">
                {formData.hero_badge}
              </Chip>
            )}
            <h2 className="font-headline text-white text-2xl md:text-4xl font-bold mb-2 drop-shadow-sm">
              {formData.hero_title || 'Judul Hero'}
            </h2>
            <p className="text-white/90 text-sm md:text-base max-w-lg drop-shadow-sm">
              {formData.hero_subtitle || 'Deskripsi atau subtitle hero section.'}
            </p>
          </div>
        </div>
      </div>

      {/* Editor Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-full border border-light-gray p-6 space-y-6 shadow-sm">
        <h2 className="font-headline text-lg font-bold text-slate-heavy border-b border-light-gray pb-3">
          Form Konten Hero
        </h2>

        {/* Badge Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-on-surface">Badge Text (Label Kecil)</label>
          <input
            type="text"
            value={formData.hero_badge}
            onChange={(e) => handleInputChange('hero_badge', e.target.value)}
            placeholder="Contoh: Vivid Explorer Mode"
            className="bg-[#F3F4F6] border border-outline-variant rounded-input px-4 py-3 text-base text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-2 focus:border-slate-heavy transition-all"
          />
          <span className="text-xs text-on-surface-variant">Label chip kecil di atas judul hero.</span>
        </div>

        {/* Title Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-on-surface">
            Judul Hero <span className="text-error">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.hero_title}
            onChange={(e) => handleInputChange('hero_title', e.target.value)}
            placeholder="Contoh: Radar UMKM"
            className="bg-[#F3F4F6] border border-outline-variant rounded-input px-4 py-3 text-base text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-2 focus:border-slate-heavy transition-all"
          />
          <span className="text-xs text-on-surface-variant">Judul utama banner di halaman depan.</span>
        </div>

        {/* Subtitle Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-on-surface">
            Subtitle / Deskripsi <span className="text-error">*</span>
          </label>
          <textarea
            required
            rows={3}
            value={formData.hero_subtitle}
            onChange={(e) => handleInputChange('hero_subtitle', e.target.value)}
            placeholder="Tuliskan deskripsi singkat pengantar..."
            className="bg-[#F3F4F6] border border-outline-variant rounded-input px-4 py-3 text-base text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-2 focus:border-slate-heavy transition-all resize-none"
          />
          <div className="flex justify-between text-xs text-on-surface-variant">
            <span>Deskripsi singkat di bawah judul.</span>
            <span>{formData.hero_subtitle.length} karakter</span>
          </div>
        </div>

        {/* Background Image Input */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-semibold text-on-surface">Gambar Background (Opsional)</label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="text-xs text-on-surface-variant mb-1 block">Input URL Gambar:</span>
              <input
                type="url"
                value={formData.hero_image_url.startsWith('data:') ? '' : formData.hero_image_url}
                onChange={(e) => handleInputChange('hero_image_url', e.target.value)}
                placeholder="https://example.com/banner.jpg"
                className="w-full bg-[#F3F4F6] border border-outline-variant rounded-input px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-2 focus:border-slate-heavy transition-all"
              />
            </div>

            <div>
              <span className="text-xs text-on-surface-variant mb-1 block">Atau Upload Gambar:</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="w-full text-xs text-on-surface-variant file:mr-3 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary-container file:text-on-primary-container hover:file:opacity-90 cursor-pointer"
              />
            </div>
          </div>

          {formData.hero_image_url && (
            <div className="flex items-center gap-3 mt-1">
              <button
                type="button"
                onClick={() => handleInputChange('hero_image_url', '')}
                className="text-xs text-error font-medium hover:underline inline-flex items-center gap-1"
              >
                <Icon name="delete" size={16} />
                Hapus gambar background
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-light-gray flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-semibold text-on-surface-variant hover:text-slate-heavy px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Reset ke Default
            </button>
            {hasChanges && (
              <button
                type="button"
                onClick={handleRevert}
                className="text-xs font-semibold text-on-surface-variant hover:text-slate-heavy px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Batal Perubahan
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="md"
              type="submit"
              loading={saving}
              disabled={saving}
            >
              <Icon name="save" size={18} />
              Simpan Perubahan
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
