'use client';

import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api-client';
import StatusBadge from '@/components/admin/StatusBadge';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminPlaceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [place, setPlace] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', status: '' });

  useEffect(() => {
    const fetchPlace = async () => {
      try {
        const data = await adminApi.getPlaceById(id);
        setPlace(data);
        setForm({ name: data.name, description: data.description, status: data.status });
      } catch {
        router.push('/admin/places');
      } finally {
        setLoading(false);
      }
    };
    fetchPlace();
  }, [id, router]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminApi.updatePlace(id, form);
      const updated = await adminApi.getPlaceById(id);
      setPlace(updated);
      setEditMode(false);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusAction = async (newStatus: string) => {
    setSaving(true);
    try {
      await adminApi.updatePlaceStatus(id, newStatus);
      const updated = await adminApi.getPlaceById(id);
      setPlace(updated);
      setForm((prev) => ({ ...prev, status: updated.status }));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-primary-container border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!place) return null;

  const formatDate = (dateStr: string) =>
    new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(dateStr));

  return (
    <div>
      <Link href="/admin/places" className="inline-flex items-center gap-1 text-sm text-on-surface-variant hover:text-slate-heavy mb-4">
        <Icon name="arrow_back" size={18} />
        Kembali ke Daftar
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-headline text-2xl font-bold text-slate-heavy">{place.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <StatusBadge status={place.status} />
            <span className="text-sm text-on-surface-variant">{place.categories?.name}</span>
            <span className="text-sm text-on-surface-variant">•</span>
            <span className="text-sm text-on-surface-variant">{place.regions?.name}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {place.status === 'pending' && (
            <>
              <Button variant="primary" size="sm" onClick={() => handleStatusAction('approved')} loading={saving}>
                Approve
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleStatusAction('rejected')} loading={saving}>
                Reject
              </Button>
            </>
          )}
          <Button
            variant={editMode ? 'primary' : 'secondary'}
            size="sm"
            onClick={editMode ? handleSave : () => setEditMode(true)}
            loading={saving}
          >
            {editMode ? 'Simpan' : 'Edit'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[22px] border border-light-gray p-6">
            <h2 className="font-headline text-lg font-semibold text-slate-heavy mb-4">Informasi</h2>
            {editMode ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">Nama</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-cool-gray border border-input-border rounded-input px-3 py-2 text-sm focus:outline-none focus:border-slate-heavy focus:border-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">Deskripsi</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={5}
                    className="w-full bg-cool-gray border border-input-border rounded-input px-3 py-2 text-sm focus:outline-none focus:border-slate-heavy focus:border-2 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="bg-cool-gray border border-input-border rounded-input px-3 py-2 text-sm focus:outline-none focus:border-slate-heavy"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-on-surface leading-relaxed">{place.description}</p>
                <div className="flex items-center gap-4 text-sm text-on-surface-variant pt-2">
                  <div className="flex items-center gap-1">
                    <Icon name="star" size={16} filled className="text-amber-500" />
                    <span>{place.rating?.toFixed(1) || '0.0'}</span>
                  </div>
                  <span>{place.review_count || 0} reviews</span>
                  <span>Dibuat: {formatDate(place.created_at)}</span>
                </div>
              </div>
            )}
          </div>

          {place.place_media && place.place_media.length > 0 && (
            <div className="bg-white rounded-[22px] border border-light-gray p-6">
              <h2 className="font-headline text-lg font-semibold text-slate-heavy mb-4">Media</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {place.place_media.map((media: any, idx: number) => (
                  <div key={idx} className="aspect-square rounded-xl overflow-hidden bg-cool-gray">
                    {media.media_type === 'image' ? (
                      <img src={media.url} alt={media.caption || ''} className="w-full h-full object-cover" />
                    ) : (
                      <video src={media.url} controls className="w-full h-full object-cover" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {place.reviews && place.reviews.length > 0 && (
            <div className="bg-white rounded-[22px] border border-light-gray p-6">
              <h2 className="font-headline text-lg font-semibold text-slate-heavy mb-4">Reviews ({place.reviews.length})</h2>
              <div className="space-y-4">
                {place.reviews.map((review: any) => (
                  <div key={review.id} className="border-b border-light-gray last:border-0 pb-3 last:pb-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-xs font-bold text-on-primary-container">
                          {review.users?.name?.charAt(0) || '?'}
                        </div>
                        <span className="text-sm font-medium">{review.users?.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Icon name="star" size={14} filled className="text-amber-500" />
                        <span className="text-sm">{review.rating}</span>
                      </div>
                    </div>
                    <p className="text-sm text-on-surface-variant mt-2">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-[22px] border border-light-gray p-6">
            <h2 className="font-headline text-base font-semibold text-slate-heavy mb-3">Detail</h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-on-surface-variant">ID</dt>
                <dd className="font-mono text-xs text-slate-heavy mt-0.5">{place.id}</dd>
              </div>
              <div>
                <dt className="text-on-surface-variant">Tipe</dt>
                <dd className="text-slate-heavy mt-0.5 capitalize">{place.type}</dd>
              </div>
              <div>
                <dt className="text-on-surface-variant">Slug</dt>
                <dd className="text-slate-heavy mt-0.5">{place.slug}</dd>
              </div>
              <div>
                <dt className="text-on-surface-variant">Sponsored</dt>
                <dd className="mt-0.5">{place.is_sponsored ? '✅ Ya' : '❌ Tidak'}</dd>
              </div>
            </dl>
          </div>

          {place.products && place.products.length > 0 && (
            <div className="bg-white rounded-[22px] border border-light-gray p-6">
              <h2 className="font-headline text-base font-semibold text-slate-heavy mb-3">Produk ({place.products.length})</h2>
              <div className="space-y-2">
                {place.products.map((product: any) => (
                  <div key={product.id} className="flex justify-between text-sm py-2 border-b border-light-gray last:border-0">
                    <span>{product.name}</span>
                    <span className="font-medium">Rp {product.price.toLocaleString('id-ID')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
