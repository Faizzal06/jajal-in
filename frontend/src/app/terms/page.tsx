'use client';

import PageShell from '@/components/layout/PageShell';
import Icon from '@/components/ui/Icon';
import Desk from '@/components/ui/Desk';

interface TermSection {
  title: string;
  points: string[];
}

const sections: TermSection[] = [
  {
    title: 'Penggunaan Layanan',
    points: [
      'Pengguna wajib mematuhi hukum yang berlaku.',
      'Dilarang keras menyalahgunakan platform untuk penipuan, spam, peretasan, atau tindakan yang merugikan Jajal.in maupun pengguna lain.',
    ],
  },
  {
    title: 'Keamanan Akun',
    points: [
      'Kerahasiaan kredensial akun (kata sandi, OTP) adalah tanggung jawab mutlak pengguna.',
      'Jajal.in tidak bertanggung jawab atas kerugian akibat kelalaian pengguna dalam menjaga keamanan akunnya.',
      'Segala aktivitas dari akun pengguna dianggap sebagai tindakan yang sah.',
    ],
  },
  {
    title: 'Konten Pengguna',
    points: [
      'Pengguna bertanggung jawab penuh atas ulasan, foto, atau video yang diunggah dan memberi lisensi kepada Jajal.in untuk menampilkannya.',
      'Jajal.in berhak menghapus konten dan memblokir akun jika terbukti mengandung unsur SARA, hoaks, pornografi, atau pelanggaran hak cipta.',
    ],
  },
  {
    title: 'Interaksi & Transaksi UMKM',
    points: [
      'Jajal.in hanya bertindak sebagai direktori informasi. Segala transaksi, kesepakatan, dan akurasi informasi merchant merupakan tanggung jawab penuh antara pengguna dan pihak UMKM, di luar tanggung jawab Jajal.in.',
    ],
  },
  {
    title: 'Privasi & Akses Lokasi',
    points: [
      'Pengelolaan data pribadi diatur dalam Kebijakan Privasi.',
      'Jajal.in memerlukan akses lokasi perangkat murni untuk mengoptimalkan rekomendasi tempat terdekat.',
      'Izin ini sepenuhnya berada dalam kendali pengguna.',
    ],
  },
  {
    title: 'Batasan Tanggung Jawab',
    points: [
      'Layanan disediakan "sebagaimana adanya" (as is).',
      'Jajal.in tidak memberikan jaminan aplikasi bebas gangguan dan tidak bertanggung jawab atas segala kerugian yang timbul akibat penggunaan informasi di dalam platform.',
    ],
  },
  {
    title: 'Pembaruan Ketentuan',
    points: [
      'Syarat dan Ketentuan ini dapat diubah sewaktu-waktu tanpa pemberitahuan prioritas.',
      'Tetap menggunakan layanan ini berarti pengguna menyetujui perubahan tersebut.',
    ],
  },
];

export default function TermsPage() {
  return (
    <PageShell title="Syarat & Ketentuan" variant="back">
      <div className="max-w-xl mx-auto py-lg space-y-lg">
        <Desk className="p-lg md:p-xl space-y-xl">
          <div className="flex items-center gap-md">
            <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center shrink-0">
              <Icon name="description" size={24} className="text-on-primary-container" filled />
            </div>
            <div>
              <h2 className="font-headline-md text-on-surface font-bold">Syarat & Ketentuan</h2>
              <p className="text-sm text-on-surface-variant mt-0.5">
                Dengan menggunakan Jajal.in, kamu dianggap telah membaca dan menyetujui ketentuan berikut:
              </p>
            </div>
          </div>

          <div>
            {sections.map((section, index) => (
              <div
                key={section.title}
                className={`py-lg ${index < sections.length - 1 ? 'border-b border-outline-variant' : ''}`}
              >
                <h3 className="font-headline-md text-on-surface font-bold mb-md">
                  {index + 1}. {section.title}
                </h3>
                <ul className="space-y-md">
                  {section.points.map((point) => (
                    <li key={point} className="flex items-start gap-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                      <p className="text-sm text-on-surface-variant leading-relaxed">{point}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="text-xs text-on-surface-variant text-center leading-relaxed">
            Terakhir diperbarui: 12 Agustus 2026
          </p>
        </Desk>
      </div>
    </PageShell>
  );
}
