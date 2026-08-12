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
      'Jajal.in adalah platform discovery berbasis komunitas untuk menemukan hidden gems, UMKM, dan pengalaman budaya di Indonesia.',
      'Layanan ini hanya dapat digunakan untuk tujuan yang sah, bukan untuk menyebarkan konten yang melanggar hukum, menyesatkan, atau merugikan pihak lain.',
      'Kami berhak menghentikan akses akun yang terbukti menyalahgunakan layanan.',
    ],
  },
  {
    title: 'Akun dan Keamanan',
    points: [
      'Kamu bertanggung jawab penuh atas kerahasiaan kredensial akun, termasuk kata sandi dan metode masuk lainnya.',
      'Segera hubungi tim kami melalui email resmi jika menemukan aktivitas mencurigakan pada akunmu.',
      'Setiap aktivitas yang dilakukan dari akunmu dianggap dilakukan oleh kamu, kecuali dapat dibuktikan sebaliknya.',
    ],
  },
  {
    title: 'Kontribusi dan Konten',
    points: [
      'Konten yang kamu unggah (foto, video, ulasan, dan deskripsi) wajib orisinal dan bukan hasil plagiarisme.',
      'Kamu memberikan izin kepada Jajal.in untuk menampilkan konten yang kamu unggah kepada pengguna lain.',
      'Konten yang mengandung SARA, kekerasan, atau informasi palsu akan dihapus dan dapat menyebabkan penonaktifan akun.',
    ],
  },
  {
    title: 'UMKM dan Iklan',
    points: [
      'Registrasi merchant dan pemasangan iklan mengikuti ketentuan yang berlaku pada halaman pendaftaran merchant.',
      'Informasi yang disajikan pada profil UMKM merupakan tanggung jawab pemilik UMKM dan dapat berubah sewaktu-waktu.',
      'Kami tidak bertanggung jawab atas transaksi yang terjadi di luar platform Jajal.in.',
    ],
  },
  {
    title: 'Privasi dan Data',
    points: [
      'Kami memproses data pribadi kamu sesuai dengan kebijakan privasi yang berlaku.',
      'Data lokasi hanya digunakan untuk menampilkan rekomendasi hidden gems dan UMKM terdekat, dan dapat kamu kendalikan melalui pengaturan perangkat.',
      'Kami tidak membagikan data pribadi kamu kepada pihak ketiga tanpa persetujuan, kecuali diwajibkan oleh hukum.',
    ],
  },
  {
    title: 'Batasan Tanggung Jawab',
    points: [
      'Jajal.in disediakan sebagaimana adanya dan tidak menjamin ketersediaan layanan secara terus-menerus tanpa gangguan.',
      'Kami tidak bertanggung jawab atas kerugian yang timbul akibat keputusan kamu berdasarkan informasi dari platform.',
      'Layanan pemeliharaan atau perbaikan teknis dapat menyebabkan layanan sementara tidak dapat diakses.',
    ],
  },
  {
    title: 'Perubahan Syarat dan Ketentuan',
    points: [
      'Syarat dan ketentuan ini dapat diperbarui sewaktu-waktu untuk menyesuaikan perkembangan layanan.',
      'Perubahan akan diumumkan melalui aplikasi, dan penggunaan lanjutan layanan dianggap sebagai persetujuan atas perubahan tersebut.',
      'Tanggal berlaku terakhir dari ketentuan ini akan selalu ditampilkan di bagian bawah halaman.',
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
                Pedoman penggunaan layanan Jajal.in yang perlu kamu pahami.
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
