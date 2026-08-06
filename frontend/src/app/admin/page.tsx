'use client';

import { useState, useEffect } from 'react';
import { adminApi, AdminDashboardResponse, AdminAuditEntry } from '@/lib/api-client';
import StatCard from '@/components/admin/StatCard';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';

const actionLabels: Record<string, string> = {
  approve_place: 'Menyetujui tempat',
  reject_place: 'Menolak tempat',
  ban_user: 'Memblokir user',
  unban_user: 'Membuka blokir user',
  change_role: 'Mengubah role',
  approve_merchant: 'Menyetujui merchant',
  reject_merchant: 'Menolak merchant',
  delete_contribution: 'Menghapus kontribusi',
  edit_place: 'Mengubah data tempat',
  delete_place: 'Menghapus tempat',
};

const formatAction = (action: string) => {
  return actionLabels[action] || action;
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Baru saja';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} menit yang lalu`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} jam yang lalu`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} hari yang lalu`;
  }

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await adminApi.getDashboard();
        setData(response);
      } catch (err: any) {
        setError(err.message || 'Gagal memuat data dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-500 p-4 rounded-[22px] border border-red-200">
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-sm font-semibold underline"
        >
          Coba lagi
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div>
      <h1 className="font-headline text-2xl text-slate-heavy mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Users"
          value={data.totalUsers || 0}
          icon="group"
          color="primary"
        />
        <StatCard
          label="Tempat Approved"
          value={data.places?.approved || 0}
          icon="place"
          color="secondary"
        />
        <StatCard
          label="Total Reviews"
          value={data.totalReviews || 0}
          icon="rate_review"
          color="tertiary"
        />
        <StatCard
          label="Total Merchants"
          value={data.totalMerchants || 0}
          icon="storefront"
          color="primary"
        />
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold text-slate-heavy mb-4">Perlu Perhatian</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/admin/places?status=pending" className="block">
            <div className="bg-white rounded-[22px] border border-light-gray p-5 flex items-center hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center mr-4">
                <Icon name="place" className="text-amber-500 text-2xl" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-heavy">Tempat Pending</h3>
                <p className="text-on-surface-variant text-sm">Menunggu persetujuan</p>
              </div>
              <div className="text-2xl font-bold text-slate-heavy">
                {data.places?.pending || 0}
              </div>
            </div>
          </Link>

          <Link href="/admin/merchants?status=pending_payment" className="block">
            <div className="bg-white rounded-[22px] border border-light-gray p-5 flex items-center hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center mr-4">
                <Icon name="payment" className="text-amber-500 text-2xl" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-heavy">Pembayaran Pending</h3>
                <p className="text-on-surface-variant text-sm">Menunggu konfirmasi</p>
              </div>
              <div className="text-2xl font-bold text-slate-heavy">
                {data.pendingPayments || 0}
              </div>
            </div>
          </Link>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold text-slate-heavy mb-4">Aktivitas Terbaru</h2>
        <div className="bg-white rounded-[22px] border border-light-gray overflow-hidden">
          {data.recentActivity && data.recentActivity.length > 0 ? (
            <div className="divide-y divide-light-gray">
              {data.recentActivity.map((entry: AdminAuditEntry) => (
                <div key={entry.id} className="p-4 hover:bg-gray-50 transition-colors flex items-start sm:items-center flex-col sm:flex-row gap-3 sm:gap-4">
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Icon name="person" className="text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-semibold text-slate-heavy">{entry.users?.name || 'Admin'}</span>{' '}
                      <span className="text-on-surface-variant">{formatAction(entry.action)}</span>{' '}
                      <span className="font-medium text-slate-heavy">{entry.target_type}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTimeAgo(entry.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-on-surface-variant">
              Belum ada aktivitas terbaru.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
