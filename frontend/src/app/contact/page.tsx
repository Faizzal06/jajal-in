'use client';

import PageShell from '@/components/layout/PageShell';
import Icon from '@/components/ui/Icon';
import Desk from '@/components/ui/Desk';

const CONTACT_EMAIL = 'jajal-in.explore@gmail.com';

export default function ContactPage() {
  return (
    <PageShell title="Hubungi Kami" variant="back">
      <div className="max-w-xl mx-auto py-lg space-y-lg">
        <Desk className="p-lg md:p-xl space-y-xl">
          <div className="flex items-center gap-md">
            <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center shrink-0">
              <Icon name="support_agent" size={24} className="text-on-primary-container" filled />
            </div>
            <div>
              <h2 className="font-headline-md text-on-surface font-bold">Hubungi Kami</h2>
              <p className="text-sm text-on-surface-variant mt-0.5">
                Jika kamu menemui kendala saat menggunakan aplikasi, tim Jajal.in siap membantu.
              </p>
            </div>
          </div>

          <div className="border border-outline-variant rounded-xl p-lg flex flex-col gap-md">
            <div className="flex items-center gap-md">
              <div className="w-10 h-10 rounded-lg bg-[#E1F3FE] flex items-center justify-center shrink-0">
                <Icon name="mail" size={20} className="text-[#1F6C9F]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-on-surface-variant">Email Support</p>
                <p className="font-body-md text-on-surface font-semibold break-all">
                  {CONTACT_EMAIL}
                </p>
              </div>
            </div>
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Kendala Penggunaan Aplikasi Jajal.in')}`}
              className="flex items-center justify-center gap-2 py-3 rounded-full bg-primary-container text-on-primary-container font-bold text-sm hover:brightness-105 active:scale-95 transition-all"
            >
              <Icon name="send" size={18} />
              Kirim Email
            </a>
          </div>

          <p className="text-xs text-on-surface-variant text-center leading-relaxed">
            Sertakan detail kendala dan akun yang kamu gunakan agar tim kami dapat membantu lebih cepat.
          </p>
        </Desk>
      </div>
    </PageShell>
  );
}
