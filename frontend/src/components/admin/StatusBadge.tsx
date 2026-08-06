const statusStyles: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-800',
  active: 'bg-emerald-100 text-emerald-800',
  pending_payment: 'bg-orange-100 text-orange-800',
  pending_approval: 'bg-amber-100 text-amber-800',
  suspended: 'bg-red-100 text-red-800',
  deleted: 'bg-gray-100 text-gray-600',
  user: 'bg-blue-100 text-blue-800',
  admin: 'bg-purple-100 text-purple-800',
  merchant: 'bg-teal-100 text-teal-800',
};

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  active: 'Aktif',
  pending_payment: 'Menunggu Bayar',
  pending_approval: 'Menunggu Approval',
  suspended: 'Suspended',
  deleted: 'Dihapus',
  user: 'User',
  admin: 'Admin',
  merchant: 'Merchant',
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
        statusStyles[status] || 'bg-gray-100 text-gray-600'
      }`}
    >
      {statusLabels[status] || status}
    </span>
  );
}
