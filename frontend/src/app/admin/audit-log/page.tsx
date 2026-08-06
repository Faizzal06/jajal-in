'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminApi, AdminAuditEntry } from '@/lib/api-client';
import AdminTable from '@/components/admin/AdminTable';
import Icon from '@/components/ui/Icon';

const actionLabels: Record<string, string> = {
  approve_place: 'Approve Tempat',
  reject_place: 'Reject Tempat',
  ban_user: 'Ban User',
  unban_user: 'Unban User',
  change_role: 'Ubah Role',
  edit_place: 'Edit Tempat',
  delete_place: 'Hapus Tempat',
  approve_merchant: 'Approve Merchant',
  reject_merchant: 'Reject Merchant',
  delete_contribution: 'Hapus Kontribusi',
};

const actionIcons: Record<string, { icon: string; color: string }> = {
  approve_place: { icon: 'check_circle', color: 'text-emerald-600' },
  reject_place: { icon: 'cancel', color: 'text-red-500' },
  ban_user: { icon: 'block', color: 'text-red-500' },
  unban_user: { icon: 'lock_open', color: 'text-emerald-600' },
  change_role: { icon: 'manage_accounts', color: 'text-blue-600' },
  edit_place: { icon: 'edit', color: 'text-amber-600' },
  delete_place: { icon: 'delete', color: 'text-red-500' },
  approve_merchant: { icon: 'storefront', color: 'text-emerald-600' },
  reject_merchant: { icon: 'storefront', color: 'text-red-500' },
  delete_contribution: { icon: 'delete', color: 'text-red-500' },
};

export default function AdminAuditLogPage() {
  const [data, setData] = useState<AdminAuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminApi.getAuditLog({ page });
      setData(result.data);
      setTotal(result.total);
    } catch {
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const formatDate = (dateStr: string) =>
    new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateStr));

  const renderDetails = (details: Record<string, unknown> | null) => {
    if (!details) return <span className="text-on-surface-variant">-</span>;
    const entries = Object.entries(details);
    if (entries.length === 0) return <span className="text-on-surface-variant">-</span>;
    const [key, value] = entries[0];
    const displayValue = typeof value === 'object' ? JSON.stringify(value).slice(0, 30) : String(value).slice(0, 30);
    return (
      <span className="text-xs font-mono text-on-surface-variant">
        {key}: {displayValue}{String(value).length > 30 ? '...' : ''}
      </span>
    );
  };

  const columns = [
    {
      key: 'admin',
      label: 'Admin',
      render: (item: AdminAuditEntry) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary-container flex items-center justify-center text-xs font-bold text-on-primary-container shrink-0">
            {item.users?.avatar_url ? (
              <img src={item.users.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" />
            ) : (
              item.users?.name?.charAt(0) || '?'
            )}
          </div>
          <span className="text-sm font-medium">{item.users?.name || '-'}</span>
        </div>
      ),
    },
    {
      key: 'action',
      label: 'Aksi',
      render: (item: AdminAuditEntry) => {
        const config = actionIcons[item.action] || { icon: 'info', color: 'text-on-surface-variant' };
        return (
          <div className="flex items-center gap-2">
            <Icon name={config.icon} size={16} className={config.color} />
            <span className="text-sm">{actionLabels[item.action] || item.action}</span>
          </div>
        );
      },
    },
    {
      key: 'target',
      label: 'Target',
      render: (item: AdminAuditEntry) => (
        <div className="text-xs">
          <span className="capitalize font-medium">{item.target_type}</span>
          <span className="text-on-surface-variant ml-1 font-mono">{item.target_id.slice(0, 8)}...</span>
        </div>
      ),
    },
    {
      key: 'details',
      label: 'Detail',
      render: (item: AdminAuditEntry) => renderDetails(item.details),
    },
    {
      key: 'created_at',
      label: 'Waktu',
      render: (item: AdminAuditEntry) => (
        <span className="text-on-surface-variant text-xs">{formatDate(item.created_at)}</span>
      ),
    },
  ];

  return (
    <div>
      <h1 className="font-headline text-2xl font-bold text-slate-heavy mb-6">Audit Log</h1>

      <AdminTable
        columns={columns}
        data={data}
        total={total}
        page={page}
        onPageChange={setPage}
        loading={loading}
        emptyMessage="Belum ada aktivitas admin"
      />
    </div>
  );
}
