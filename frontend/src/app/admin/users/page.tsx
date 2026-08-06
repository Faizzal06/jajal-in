'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminApi, AdminUser, PaginatedResponse } from '@/lib/api-client';
import AdminTable from '@/components/admin/AdminTable';
import StatusBadge from '@/components/admin/StatusBadge';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import Icon from '@/components/ui/Icon';
import Link from 'next/link';

export default function AdminUsersPage() {
  const [data, setData] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('');
  const [search, setSearch] = useState('');
  const [banTarget, setBanTarget] = useState<AdminUser | null>(null);
  const [unbanTarget, setUnbanTarget] = useState<AdminUser | null>(null);
  const [banReason, setBanReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminApi.getUsers({
        role: role || undefined,
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
  }, [role, search, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setActionLoading(true);
    try {
      await adminApi.updateUserRole(userId, newRole);
      fetchData();
    } finally {
      setActionLoading(false);
    }
  };

  const handleBan = async () => {
    if (!banTarget || !banReason) return;
    setActionLoading(true);
    try {
      await adminApi.banUser(banTarget.id, banReason);
      setBanTarget(null);
      setBanReason('');
      fetchData();
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnban = async () => {
    if (!unbanTarget) return;
    setActionLoading(true);
    try {
      await adminApi.unbanUser(unbanTarget.id);
      setUnbanTarget(null);
      fetchData();
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr: string) =>
    new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(dateStr));

  const columns = [
    {
      key: 'user',
      label: 'User',
      render: (item: AdminUser) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-xs font-bold text-on-primary-container shrink-0">
            {item.avatar_url ? (
              <img src={item.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              item.name?.charAt(0)?.toUpperCase() || '?'
            )}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-slate-heavy truncate">{item.name}</p>
            <p className="text-xs text-on-surface-variant truncate">{item.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (item: AdminUser) => <StatusBadge status={item.role} />,
    },
    {
      key: 'total_xp',
      label: 'XP',
      render: (item: AdminUser) => (
        <span className="text-sm font-medium">{item.total_xp?.toLocaleString('id-ID') || 0}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: AdminUser) => (
        item.banned_at ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">Banned</span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">Aktif</span>
        )
      ),
    },
    {
      key: 'created_at',
      label: 'Bergabung',
      render: (item: AdminUser) => (
        <span className="text-on-surface-variant text-xs">{formatDate(item.created_at)}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Aksi',
      render: (item: AdminUser) => (
        <div className="flex items-center gap-1">
          <Link
            href={`/admin/users/${item.id}`}
            className="p-1.5 rounded-lg hover:bg-surface-container-high transition-colors"
            title="Detail"
          >
            <Icon name="visibility" size={18} className="text-on-surface-variant" />
          </Link>
          <select
            value={item.role}
            onChange={(e) => handleRoleChange(item.id, e.target.value)}
            disabled={actionLoading}
            className="text-xs border border-input-border rounded-lg px-1.5 py-1 bg-white focus:outline-none"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="merchant">Merchant</option>
          </select>
          {item.banned_at ? (
            <button
              onClick={() => setUnbanTarget(item)}
              className="p-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
              title="Unban"
            >
              <Icon name="lock_open" size={18} className="text-emerald-600" />
            </button>
          ) : (
            <button
              onClick={() => setBanTarget(item)}
              className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
              title="Ban"
            >
              <Icon name="block" size={18} className="text-red-500" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <h1 className="font-headline text-2xl font-bold text-slate-heavy mb-6">User Management</h1>

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Cari user..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="bg-white border border-input-border rounded-input px-3 py-2 text-sm w-64 focus:outline-none focus:border-slate-heavy focus:border-2"
        />
        <select
          value={role}
          onChange={(e) => { setRole(e.target.value); setPage(1); }}
          className="bg-white border border-input-border rounded-input px-3 py-2 text-sm focus:outline-none focus:border-slate-heavy"
        >
          <option value="">Semua Role</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
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
        emptyMessage="Tidak ada user ditemukan"
      />

      <ConfirmDialog
        open={!!banTarget}
        title="Ban User"
        description={`Apakah Anda yakin ingin memban ${banTarget?.name}?`}
        confirmLabel="Ban User"
        variant="danger"
        loading={actionLoading}
        onConfirm={handleBan}
        onCancel={() => { setBanTarget(null); setBanReason(''); }}
      >
        <textarea
          placeholder="Alasan ban..."
          value={banReason}
          onChange={(e) => setBanReason(e.target.value)}
          rows={3}
          className="w-full bg-cool-gray border border-input-border rounded-input px-3 py-2 text-sm focus:outline-none focus:border-slate-heavy resize-none"
        />
      </ConfirmDialog>

      <ConfirmDialog
        open={!!unbanTarget}
        title="Unban User"
        description={`Apakah Anda yakin ingin mengaktifkan kembali ${unbanTarget?.name}?`}
        confirmLabel="Unban"
        variant="default"
        loading={actionLoading}
        onConfirm={handleUnban}
        onCancel={() => setUnbanTarget(null)}
      />
    </div>
  );
}
