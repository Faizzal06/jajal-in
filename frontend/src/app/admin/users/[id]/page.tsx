'use client';

import { useState, useEffect } from 'react';
import { adminApi, AdminUser } from '@/lib/api-client';
import StatusBadge from '@/components/admin/StatusBadge';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [banOpen, setBanOpen] = useState(false);
  const [unbanOpen, setUnbanOpen] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await adminApi.getUserById(id);
        setUser(data);
      } catch {
        router.push('/admin/users');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id, router]);

  const handleRoleChange = async (newRole: string) => {
    setActionLoading(true);
    try {
      const updated = await adminApi.updateUserRole(id, newRole);
      setUser((prev) => prev ? { ...prev, role: updated.role } : null);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBan = async () => {
    if (!banReason) return;
    setActionLoading(true);
    try {
      const updated = await adminApi.banUser(id, banReason);
      setUser((prev) => prev ? { ...prev, banned_at: updated.banned_at, ban_reason: updated.ban_reason } : null);
      setBanOpen(false);
      setBanReason('');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnban = async () => {
    setActionLoading(true);
    try {
      await adminApi.unbanUser(id);
      setUser((prev) => prev ? { ...prev, banned_at: null, ban_reason: null } : null);
      setUnbanOpen(false);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-primary-container border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const formatDate = (dateStr: string) =>
    new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(dateStr));

  return (
    <div>
      <Link href="/admin/users" className="inline-flex items-center gap-1 text-sm text-on-surface-variant hover:text-slate-heavy mb-4">
        <Icon name="arrow_back" size={18} />
        Kembali ke Daftar
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[22px] border border-light-gray p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center text-xl font-bold text-on-primary-container mb-3">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="" className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  user.name?.charAt(0)?.toUpperCase() || '?'
                )}
              </div>
              <h1 className="font-headline text-xl font-bold text-slate-heavy">{user.name}</h1>
              <p className="text-sm text-on-surface-variant">{user.email}</p>
              <div className="mt-2">
                <StatusBadge status={user.role} />
              </div>
              {user.regions?.name && (
                <p className="text-xs text-on-surface-variant mt-2">
                  <Icon name="location_on" size={14} className="inline" /> {user.regions.name}
                </p>
              )}
              {user.levels?.name && (
                <p className="text-xs text-on-surface-variant mt-1">
                  Level {user.levels.number}: {user.levels.name}
                </p>
              )}
            </div>

            {user.banned_at && (
              <div className="mt-4 p-3 bg-red-50 rounded-xl border border-red-200">
                <p className="text-xs font-semibold text-red-800">⛔ User Dibanned</p>
                <p className="text-xs text-red-600 mt-1">Alasan: {user.ban_reason}</p>
                <p className="text-xs text-red-500 mt-1">Sejak: {formatDate(user.banned_at)}</p>
              </div>
            )}

            <div className="mt-6 space-y-3">
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">Ubah Role</label>
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  disabled={actionLoading}
                  className="w-full bg-cool-gray border border-input-border rounded-input px-3 py-2 text-sm focus:outline-none focus:border-slate-heavy"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="merchant">Merchant</option>
                </select>
              </div>

              {user.banned_at ? (
                <Button variant="primary" size="sm" onClick={() => setUnbanOpen(true)} loading={actionLoading} className="w-full">
                  Unban User
                </Button>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => setBanOpen(true)} loading={actionLoading} className="w-full">
                  Ban User
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-[22px] border border-light-gray p-5 text-center">
              <p className="text-2xl font-headline font-bold text-slate-heavy">{user.approved_places_count || 0}</p>
              <p className="text-xs text-on-surface-variant mt-1">Tempat</p>
            </div>
            <div className="bg-white rounded-[22px] border border-light-gray p-5 text-center">
              <p className="text-2xl font-headline font-bold text-slate-heavy">{user.reviews_count || 0}</p>
              <p className="text-xs text-on-surface-variant mt-1">Reviews</p>
            </div>
            <div className="bg-white rounded-[22px] border border-light-gray p-5 text-center">
              <p className="text-2xl font-headline font-bold text-slate-heavy">{user.total_xp?.toLocaleString('id-ID') || 0}</p>
              <p className="text-xs text-on-surface-variant mt-1">Total XP</p>
            </div>
          </div>

          <div className="bg-white rounded-[22px] border border-light-gray p-6">
            <h2 className="font-headline text-lg font-semibold text-slate-heavy mb-4">Informasi Akun</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-on-surface-variant">ID</dt>
                <dd className="font-mono text-xs">{user.id}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-on-surface-variant">Bergabung</dt>
                <dd>{formatDate(user.created_at)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-on-surface-variant">Status</dt>
                <dd>{user.banned_at ? '🔴 Banned' : '🟢 Aktif'}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={banOpen}
        title="Ban User"
        description={`Apakah Anda yakin ingin memban ${user.name}?`}
        confirmLabel="Ban User"
        variant="danger"
        loading={actionLoading}
        onConfirm={handleBan}
        onCancel={() => { setBanOpen(false); setBanReason(''); }}
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
        open={unbanOpen}
        title="Unban User"
        description={`Apakah Anda yakin ingin mengaktifkan kembali ${user.name}?`}
        confirmLabel="Unban"
        variant="default"
        loading={actionLoading}
        onConfirm={handleUnban}
        onCancel={() => setUnbanOpen(false)}
      />
    </div>
  );
}
