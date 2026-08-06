'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminApi, AdminPlace } from '@/lib/api-client';
import AdminTable from '@/components/admin/AdminTable';
import StatusBadge from '@/components/admin/StatusBadge';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import Icon from '@/components/ui/Icon';
import Link from 'next/link';

export default function AdminPlacesPage() {
  const [data, setData] = useState<AdminPlace[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminApi.getPlaces({
        status: status || undefined,
        search: search || undefined,
        type: type || undefined,
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
  }, [status, search, type, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setActionLoading(true);
    try {
      await adminApi.updatePlaceStatus(id, newStatus);
      fetchData();
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await adminApi.deletePlace(deleteTarget);
      setDeleteTarget(null);
      fetchData();
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(dateStr));
  };

  const columns = [
    {
      key: 'name',
      label: 'Nama',
      render: (item: AdminPlace) => (
        <div className="flex items-center gap-2">
          {item.categories?.icon && <Icon name={item.categories.icon} size={18} className="text-on-surface-variant" />}
          <span className="font-medium text-slate-heavy">{item.name}</span>
        </div>
      ),
    },
    {
      key: 'region',
      label: 'Region',
      render: (item: AdminPlace) => (
        <span className="text-on-surface-variant">{item.regions?.name || '-'}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: AdminPlace) => <StatusBadge status={item.status} />,
    },
    {
      key: 'rating',
      label: 'Rating',
      render: (item: AdminPlace) => (
        <div className="flex items-center gap-1">
          <Icon name="star" size={16} filled className="text-amber-500" />
          <span>{item.rating?.toFixed(1) || '0.0'}</span>
        </div>
      ),
    },
    {
      key: 'created_at',
      label: 'Tanggal',
      render: (item: AdminPlace) => (
        <span className="text-on-surface-variant text-xs">{formatDate(item.created_at)}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Aksi',
      render: (item: AdminPlace) => (
        <div className="flex items-center gap-1">
          <Link
            href={`/admin/places/${item.id}`}
            className="p-1.5 rounded-lg hover:bg-surface-container-high transition-colors"
            title="Detail"
          >
            <Icon name="visibility" size={18} className="text-on-surface-variant" />
          </Link>
          {item.status === 'pending' && (
            <>
              <button
                onClick={() => handleStatusChange(item.id, 'approved')}
                disabled={actionLoading}
                className="p-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
                title="Approve"
              >
                <Icon name="check_circle" size={18} className="text-emerald-600" />
              </button>
              <button
                onClick={() => handleStatusChange(item.id, 'rejected')}
                disabled={actionLoading}
                className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                title="Reject"
              >
                <Icon name="cancel" size={18} className="text-red-500" />
              </button>
            </>
          )}
          <button
            onClick={() => setDeleteTarget(item.id)}
            className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
            title="Hapus"
          >
            <Icon name="delete" size={18} className="text-red-400" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <h1 className="font-headline text-2xl font-bold text-slate-heavy mb-6">Moderasi Tempat</h1>

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Cari tempat..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="bg-white border border-input-border rounded-input px-3 py-2 text-sm w-64 focus:outline-none focus:border-slate-heavy focus:border-2"
        />
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="bg-white border border-input-border rounded-input px-3 py-2 text-sm focus:outline-none focus:border-slate-heavy"
        >
          <option value="">Semua Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select
          value={type}
          onChange={(e) => { setType(e.target.value); setPage(1); }}
          className="bg-white border border-input-border rounded-input px-3 py-2 text-sm focus:outline-none focus:border-slate-heavy"
        >
          <option value="">Semua Tipe</option>
          <option value="gem">Hidden Gem</option>
          <option value="merchant">Merchant</option>
        </select>
      </div>

      <AdminTable
        columns={columns}
        data={data}
        total={total}
        page={page}
        onPageChange={setPage}
        loading={loading}
        emptyMessage="Tidak ada tempat ditemukan"
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Hapus Tempat"
        description="Apakah Anda yakin ingin menghapus tempat ini? Tindakan ini tidak bisa dibatalkan."
        confirmLabel="Hapus"
        variant="danger"
        loading={actionLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
