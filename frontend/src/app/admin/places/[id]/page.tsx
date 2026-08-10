'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { adminApi, AdminPlace } from '@/lib/api-client';
import StatusBadge from '@/components/admin/StatusBadge';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import Chip from '@/components/ui/Chip';
import Input from '@/components/ui/Input';
import { categories } from '@/lib/mock/regions';

const LocationPicker = dynamic(() => import('@/components/map/LocationPicker'), {
  ssr: false,
  loading: () => (
    <div className="h-64 sm:h-80 bg-surface-dim/40 rounded-2xl border border-outline-variant animate-pulse flex flex-col items-center justify-center gap-2 text-on-surface-variant">
      <Icon name="map" size={32} className="text-outline-variant animate-bounce" />
      <span className="text-xs font-medium">Memuat Peta Interaktif...</span>
    </div>
  ),
});

interface DetailedAdminPlace extends AdminPlace {
  place_media?: { url: string; media_type?: string; caption?: string }[];
  place_highlights?: { id: string; title: string; description: string; icon: string }[];
  reviews?: { id: string; rating: number; text: string; users?: { name: string } }[];
  products?: { id: string; name: string; price: number }[];
}

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

export default function AdminPlaceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [place, setPlace] = useState<DetailedAdminPlace | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form states matching /post
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('pending');
  const [lat, setLat] = useState<number>(-8.5069);
  const [lng, setLng] = useState<number>(115.2625);
  const [images, setImages] = useState<string[]>([]);
  const [highlights, setHighlights] = useState<{ title: string; description: string; icon: string }[]>([
    { title: '', description: '', icon: 'landscape' },
  ]);

  // Audio Story state
  const [audioTitle, setAudioTitle] = useState('');
  const [audioFileName, setAudioFileName] = useState('');

  useEffect(() => {
    const fetchPlace = async () => {
      try {
        const data = await adminApi.getPlaceById(id) as DetailedAdminPlace;
        setPlace(data);

        setName(data.name || '');
        setDescription(data.description || '');
        setStatus(data.status || 'pending');
        setCategory(data.category_id || data.categories?.name || '');
        if (data.lat !== undefined && data.lng !== undefined) {
          setLat(data.lat);
          setLng(data.lng);
        }

        if (data.place_media && data.place_media.length > 0) {
          setImages(data.place_media.map((m) => m.url));
        }

        if (data.place_highlights && data.place_highlights.length > 0) {
          setHighlights(
            data.place_highlights.map((h) => ({
              title: h.title || '',
              description: h.description || '',
              icon: h.icon || 'landscape',
            }))
          );
        }
      } catch {
        router.push('/admin/places');
      } finally {
        setLoading(false);
      }
    };
    fetchPlace();
  }, [id, router]);

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

  const handleSave = async () => {
    setSaving(true);
    setErrorMsg('');
    setSaveSuccess(false);
    try {
      await adminApi.updatePlace(id, {
        name: name.trim(),
        description: description.trim(),
        status,
        category_id: category,
        lat,
        lng,
        media: images,
        highlights: highlights.filter((h) => h.title.trim()),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      const updated = await adminApi.getPlaceById(id) as DetailedAdminPlace;
      setPlace(updated);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal menyimpan perubahan');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusAction = async (newStatus: string) => {
    setSaving(true);
    try {
      await adminApi.updatePlaceStatus(id, newStatus);
      setStatus(newStatus);
      const updated = await adminApi.getPlaceById(id) as DetailedAdminPlace;
      setPlace(updated);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal memperbarui status');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-10 h-10 border-4 border-primary-container border-t-primary rounded-full animate-spin" />
        <p className="text-sm font-medium text-on-surface-variant">Memuat data tempat...</p>
      </div>
    );
  }

  if (!place) return null;

  const formatDate = (dateStr: string) =>
    new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(dateStr));

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      {/* Top Header & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/places"
            className="inline-flex items-center gap-1 text-sm font-medium text-on-surface-variant hover:text-slate-heavy mb-2 transition-colors"
          >
            <Icon name="arrow_back" size={18} />
            Kembali ke Daftar Tempat
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="font-headline-md text-2xl md:text-3xl font-bold text-slate-heavy">{name || place.name}</h1>
            <StatusBadge status={status} />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {status === 'pending' && (
            <>
              <Button variant="primary" size="sm" onClick={() => handleStatusAction('approved')} disabled={saving}>
                Approve
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleStatusAction('rejected')} disabled={saving}>
                Reject
              </Button>
            </>
          )}
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            <Icon name="save" size={18} /> {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </div>
      </div>

      {saveSuccess && (
        <div className="bg-primary-container/30 border border-primary-container text-on-primary-container text-sm rounded-xl px-4 py-3 flex items-center gap-2">
          <Icon name="check_circle" size={20} className="text-primary" />
          <span>Perubahan tempat berhasil disimpan!</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-error/10 border border-error text-error text-sm rounded-xl px-4 py-3 flex items-center gap-2">
          <Icon name="error" size={20} />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form (2 Columns on Large Screens) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Place Info & Category */}
          <div className="bg-white rounded-2xl border border-outline-variant p-6 space-y-4 shadow-sm">
            <h2 className="font-headline-md text-lg font-bold text-slate-heavy flex items-center gap-2">
              <Icon name="edit_note" size={22} className="text-primary" /> Informasi Utama
            </h2>

            <Input
              label="Nama Tempat"
              placeholder="Contoh: Kopi Rimba, Ubud"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

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
              <label className="text-sm font-semibold text-on-surface">Cerita Penjelajah / Deskripsi</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Apa yang membuat tempat ini spesial?"
                rows={5}
                className="bg-white border border-outline-variant rounded-input px-4 py-3 text-base text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-2 focus:border-slate-heavy transition-all resize-none"
              />
            </div>
          </div>

          {/* Section 2: Experience Highlights */}
          <div className="bg-white rounded-2xl border border-outline-variant p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-headline-md text-lg font-bold text-slate-heavy flex items-center gap-2">
                  <Icon name="stars" size={22} className="text-primary" /> Experience Highlights
                </h2>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Tambahkan daya tarik utama tempat ini untuk ditampilkan di halaman detail.
                </p>
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
                <div key={idx} className="bg-surface-dim/20 border border-outline-variant rounded-2xl p-4 space-y-3 relative">
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
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Judul (contoh: Sunset Point)"
                      value={hl.title}
                      onChange={(e) => handleHighlightChange(idx, 'title', e.target.value)}
                      className="sm:col-span-2 bg-white border border-outline-variant rounded-xl px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-slate-heavy"
                    />
                    <select
                      value={hl.icon}
                      onChange={(e) => handleHighlightChange(idx, 'icon', e.target.value)}
                      className="bg-white border border-outline-variant rounded-xl px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-slate-heavy"
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
                    className="w-full bg-white border border-outline-variant rounded-xl px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-slate-heavy resize-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Audio Story (Opsional) */}
          <div className="bg-white rounded-2xl border border-outline-variant p-6 space-y-3 shadow-sm">
            <h2 className="font-headline-md text-lg font-bold text-slate-heavy flex items-center gap-2">
              <Icon name="graphic_eq" size={22} className="text-primary" /> Audio Story (Opsional)
            </h2>
            <p className="text-xs text-on-surface-variant">
              Unggah berkas rekaman suara cerita/narasi lokal (akan disimpan di bucket <code>audio-stories</code>).
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
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

          {/* Section 4: Location Picker */}
          <div className="bg-white rounded-2xl border border-outline-variant p-6 space-y-3 shadow-sm">
            <h2 className="font-headline-md text-lg font-bold text-slate-heavy flex items-center gap-2">
              <Icon name="map" size={22} className="text-primary" /> Lokasi Presisi Tempat
            </h2>
            <p className="text-xs text-on-surface-variant mb-2">
              Gunakan peta interaktif, cari nama alamat, atau masukkan titik koordinat desimal.
            </p>
            <LocationPicker
              lat={lat}
              lng={lng}
              onChange={(newLat, newLng) => {
                setLat(newLat);
                setLng(newLng);
              }}
            />
          </div>

          {/* Section 5: Media Upload & Management */}
          <div className="bg-white rounded-2xl border border-outline-variant p-6 space-y-3 shadow-sm">
            <h2 className="font-headline-md text-lg font-bold text-slate-heavy flex items-center gap-2">
              <Icon name="photo_library" size={22} className="text-primary" /> Media & Foto Tempat
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
        </div>

        {/* Sidebar Info & Controls */}
        <div className="space-y-6">
          {/* Status & Control Card */}
          <div className="bg-white rounded-2xl border border-outline-variant p-6 space-y-4 shadow-sm sticky top-20">
            <h3 className="font-headline-md text-base font-bold text-slate-heavy border-b border-outline-variant/30 pb-3">
              Kontrol Admin
            </h3>
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">Status Tempat</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-white border border-outline-variant rounded-xl px-3 py-2 text-sm text-on-surface font-semibold focus:outline-none focus:border-slate-heavy"
              >
                <option value="pending">🟡 Pending (Menunggu Review)</option>
                <option value="approved">🟢 Approved (Disetujui)</option>
                <option value="rejected">🔴 Rejected (Ditolak)</option>
              </select>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Button variant="primary" onClick={handleSave} disabled={saving} className="w-full justify-center">
                <Icon name="save" size={18} /> {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>

              <Link
                href={`/detail/${place.id}`}
                target="_blank"
                className="w-full border border-outline-variant bg-white text-on-surface font-bold py-2.5 rounded-xl hover:bg-surface-dim transition-all flex items-center justify-center gap-1.5 text-xs"
              >
                <Icon name="open_in_new" size={16} /> Lihat di Halaman Detail
              </Link>
            </div>

            <div className="pt-4 border-t border-outline-variant/30 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">ID Tempat</span>
                <span className="font-mono text-slate-heavy font-medium truncate max-w-[120px]" title={place.id}>
                  {place.id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Tipe</span>
                <span className="text-slate-heavy font-medium capitalize">{place.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Sponsored</span>
                <span className="font-medium">{place.is_sponsored ? '✅ Ya' : '❌ Tidak'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Dibuat Pada</span>
                <span className="text-slate-heavy font-medium">{formatDate(place.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
