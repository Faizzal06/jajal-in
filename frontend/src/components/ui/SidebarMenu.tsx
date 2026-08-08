import { useEffect } from 'react';
import Icon from '@/components/ui/Icon';

interface MenuItem {
  label: string;
  icon: string;
  onClick?: () => void;
}

interface SidebarMenuProps {
  /** Controls visibility of the drawer */
  isOpen: boolean;
  /** Called when the drawer should be closed (overlay click or close button) */
  onClose: () => void;
}

const items: MenuItem[] = [
  { label: 'Pengaturan Aplikasi', icon: 'settings' },
  { label: 'Pusat Bantuan', icon: 'help' },
  { label: 'Hubungi Kami', icon: 'support_agent' },
  { label: 'Syarat & Ketentuan', icon: 'description' },
];

export default function SidebarMenu({ isOpen, onClose }: SidebarMenuProps) {
  // Prevent body scroll when the sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={onClose}
          aria-label="Close sidebar overlay"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-outline-variant transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out z-50`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-outline-variant">
          <h2 className="font-headline-md text-on-surface">Menu</h2>
          <button type="button" onClick={onClose} aria-label="Close sidebar">
            <Icon name="close" size={24} />
          </button>
        </div>

          {/* Menu List */}
          <nav className="flex flex-col py-2 space-y-1">
            {items.map((item) => (
              <button
                key={item.label}
                type="button"
                className="flex items-center gap-3 px-4 py-3 text-on-surface hover:bg-surface-dim rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                onClick={item.onClick}
              >
                <Icon name={item.icon} size={20} />
                <span className="font-body-md">{item.label}</span>
              </button>
            ))}
            {/* Divider before Admin */}
            <hr className="my-2 border-t border-outline-variant" />
            {/* Admin Item */}
            <button
              type="button"
              onClick={() => {
                // Assuming navigation via router, placeholder implementation
                window.location.href = '/admin';
              }}
              className="flex items-center gap-3 px-4 py-3 mt-1 text-on-primary bg-primary-container hover:bg-primary-container/90 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Icon name="shield" size={20} />
              <span className="font-body-md">Admin</span>
            </button>
          </nav>
      </aside>
    </>
  );
}
