'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminApi, AdminMerchant } from '@/lib/api-client';
import AdminTable from '@/components/admin/AdminTable';
import StatusBadge from '@/components/admin/StatusBadge';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import Icon from '@/components/ui/Icon';

export default function AdminMerchantsPage() {
  const [data, setData] = useState<AdminMerchant[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [approveTarget, setApproveTarget] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminApi.getMerchants({
        status: status || undefined,
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
  }, [status, search, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleApprove = async () => {
    if (!approveTarget) return;
    setActionLoading(true);
    try {
      await adminApi.approveMerchant(approveTarget);
      setApproveTarget(null);
      fetchData();
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    setActionLoading(true);
    try {
      await adminApi.rejectMerchant(rejectTarget);
      setRejectTarget(null);
      fetchData();
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr: string) =>
    new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(dateStr));

  const isPending = (s: string) => ['pending', 'pending_payment', 'pending_approval'].includes(s);

  const columns = [
    {
      key: 'name',
      label: 'Nama Usaha',
      render: (item: AdminMerchant) => (
        <span className="font-medium text-slate-heavy">{item.name}</span>
      ),
    },
    {
      key: 'owner',
      label: 'Owner',
      render: (item: AdminMerchant) => (
        <div className="min-w-0">
          <p className="text-sm">{item.users?.name || '-'}</p>
          <p className="text-xs text-on-surface-variant">{item.users?.email || ''}</p>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Kategori',
      render: (item: AdminMerchant) => (
        <span className="text-on-surface-variant">{item.categories?.name || '-'}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: AdminMerchant) => <StatusBadge status={item.status} />,
    },
    {
      key: 'created_at',
      label: 'Tanggal',
      render: (item: AdminMerchant) => (
        <span className="text-on-surface-variant text-xs">{formatDate(item.created_at)}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Aksi',
      render: (item: AdminMerchant) => (
        <div className="flex items-center gap-1">
          {isPending(item.status) && (
            <>
              <button
                onClick={() => setApproveTarget(item.id)}
                className="p-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
                title="Approve"
              >
                <Icon name="check_circle" size={18} className="text-emerald-600" />
              </button>
              <button
                onClick={() => setRejectTarget(item.id)}
                className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                title="Reject"
              >
                <Icon name="cancel" size={18} className="text-red-500" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <h1 className="font-headline text-2xl font-bold text-slate-heavy mb-6">Merchant Management</h1>

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Cari merchant..."
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
          <option value="pending_payment">Menunggu Bayar</option>
          <option value="pending">Pending Approval</option>
          <option value="active">Aktif</option>
          <option value="suspended">Suspended</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <AdminTable
        columns={columns}
        data={data}
        total={total}
        page={page}
        onPageChange={setPage}
        loading={loading}
        emptyMessage="Tidak ada merchant ditemukan"
      />

      <ConfirmDialog
        open={!!approveTarget}
        title="Approve Merchant"
        description="Apakah Anda yakin ingin menyetujui merchant ini? Status akan berubah menjadi aktif."
        confirmLabel="Approve"
        variant="default"
        loading={actionLoading}
        onConfirm={handleApprove}
        onCancel={() => setApproveTarget(null)}
      />

      <ConfirmDialog
        open={!!rejectTarget}
        title="Reject Merchant"
        description="Apakah Anda yakin ingin menolak merchant ini?"
        confirmLabel="Reject"
        variant="danger"
        loading={actionLoading}
        onConfirm={handleReject}
        onCancel={() => setRejectTarget(null)}
      />
    </div>
  );
}
