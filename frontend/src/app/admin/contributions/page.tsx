'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminApi, AdminContribution } from '@/lib/api-client';
import AdminTable from '@/components/admin/AdminTable';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import Icon from '@/components/ui/Icon';

export default function AdminContributionsPage() {
  const [data, setData] = useState<AdminContribution[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminApi.getContributions({
        search: search || undefined,
        page,
      });
      setData(result.data);
      setTotal(result.total);
    } catch {
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await adminApi.deleteContribution(deleteTarget);
      setDeleteTarget(null);
      fetchData();
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr: string) =>
    new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(dateStr));

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <Icon key={i} name="star" size={14} filled={i < rating} className={i < rating ? 'text-amber-500' : 'text-gray-300'} />
        ))}
      </div>
    );
  };

  const columns = [
    {
      key: 'user',
      label: 'User',
      render: (item: AdminContribution) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary-container flex items-center justify-center text-xs font-bold text-on-primary-container shrink-0">
            {item.users?.avatar_url ? (
              <img src={item.users.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" />
            ) : (
              item.users?.name?.charAt(0) || '?'
            )}
          </div>
          <span className="text-sm">{item.users?.name || '-'}</span>
        </div>
      ),
    },
    {
      key: 'place',
      label: 'Tempat',
      render: (item: AdminContribution) => (
        <span className="text-sm text-on-surface-variant">{item.places?.name || '-'}</span>
      ),
    },
    {
      key: 'rating',
      label: 'Rating',
      render: (item: AdminContribution) => renderStars(item.rating),
    },
    {
      key: 'text',
      label: 'Review',
      className: 'max-w-[200px]',
      render: (item: AdminContribution) => (
        <p className="text-sm text-on-surface-variant truncate">{item.text}</p>
      ),
    },
    {
      key: 'is_tip',
      label: 'Tip?',
      render: (item: AdminContribution) => (
        item.is_tip ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">Tip</span>
        ) : (
          <span className="text-xs text-on-surface-variant">-</span>
        )
      ),
    },
    {
      key: 'created_at',
      label: 'Tanggal',
      render: (item: AdminContribution) => (
        <span className="text-on-surface-variant text-xs">{formatDate(item.created_at)}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Aksi',
      render: (item: AdminContribution) => (
        <button
          onClick={() => setDeleteTarget(item.id)}
          className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
          title="Hapus"
        >
          <Icon name="delete" size={18} className="text-red-400" />
        </button>
      ),
    },
  ];

  return (
    <div>
      <h1 className="font-headline text-2xl font-bold text-slate-heavy mb-6">Moderasi Kontribusi</h1>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Cari review..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="bg-white border border-input-border rounded-input px-3 py-2 text-sm w-64 focus:outline-none focus:border-slate-heavy focus:border-2"
        />
      </div>

      <AdminTable
        columns={columns}
        data={data}
        total={total}
        page={page}
        onPageChange={setPage}
        loading={loading}
        emptyMessage="Tidak ada kontribusi ditemukan"
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Hapus Kontribusi"
        description="Apakah Anda yakin ingin menghapus kontribusi ini? Tindakan ini tidak bisa dibatalkan."
        confirmLabel="Hapus"
        variant="danger"
        loading={actionLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
