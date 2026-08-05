# jajal.in — Product Requirements Document (PRD)

> **Versi:** 1.5 (Final Architecture: Next.js, Express, Supabase)  
> **Tanggal:** 29 Juli 2026  
> **Status:** Draft  
> **Platform:** Mobile-first responsive web app (PWA-ready)  
> **Bahasa UI:** Bahasa Indonesia (konten utama), English (konten wisata internasional)

---

## 1. Ringkasan Produk

**jajal.in** adalah aplikasi *travel discovery* berbasis komunitas yang menghubungkan traveler dengan **hidden gems** lokal, **UMKM** (Usaha Mikro Kecil Menengah), dan **pengalaman budaya** otentik di seluruh Indonesia. Aplikasi ini menggabungkan eksplorasi berbasis peta **OpenStreetMap**, rekomendasi umum di halaman Explore, kontribusi konten user-generated, ekosistem promosi UMKM lokal, serta sistem gamifikasi berbasis kontribusi wilayah — semua dibalut dengan desain **Vivid Explorer** yang modern dan berani.

### 1.1 Visi
Menjadi platform utama untuk menemukan dan mendukung permata tersembunyi lokal Indonesia, sekaligus memberdayakan komunitas traveler dan pelaku UMKM.

### 1.2 Target Pengguna
| Segmen | Deskripsi |
|---|---|
| **Traveler Digital** | Tech-savvy, mencari pengalaman autentik di luar jalur wisata mainstream |
| **Komunitas Explorer** | Kontributor aktif yang berbagi ulasan, foto, dan cerita perjalanan |
| **Pelaku UMKM & Merchant** | Pemilik usaha lokal yang mendaftar dan beriklan untuk menjangkau traveler sekitar |
| **Digital Nomad** | Pekerja remote yang menjelajah sambil bekerja, menghargai efisiensi dan presisi |

---

## 2. Arsitektur Informasi & Navigasi

### 2.1 Bottom Navigation Bar (Navigasi Utama)
Navigasi utama menggunakan **fixed bottom dock bar** dengan 5 tab, desain pill rounded, dan ikon Material Symbols Outlined:

| Tab | Ikon | Deskripsi |
|---|---|---|
| **Explore** | `explore` | Feed discovery utama — menampilkan rekomendasi destinasi & UMKM secara umum (*curated recommendation*) |
| **Map** | `map` | Peta interaktif berbasis **OpenStreetMap** untuk eksplorasi berbasis lokasi terdekat (*proximity*) |
| **Post** | `add_circle` | Tombol sentral untuk menambah kontribusi hidden gem baru (flow 3 langkah) |
| **Awards** | `military_tech` | Pusat gamifikasi — level, badge, leaderboard kontribusi wilayah |
| **Profile** | `person` | Profil pengguna, otentikasi (Google OAuth), statistik kontribusi, dan akses dashboard merchant |

**Perilaku aktif tab:** Tab yang aktif menampilkan background pill `primary-container` (lime green `#A3E635`) dengan ikon filled dan teks gelap.

### 2.2 Top App Bar (Header)
- **Sticky header** dengan border bawah halus (`border-outline-variant`)
- **Kiri:** Hamburger menu (drawer toggle) atau tombol back (pada halaman detail)
- **Tengah/Kiri:** Logo teks "jajal.in" (Space Grotesk, bold, warna `primary`)
- **Kanan:** Avatar profil pengguna (diambil dari profil Google) dalam lingkaran dengan border `primary-container`.

---

## 3. Halaman & Fitur Detail

---

### 3.1 Halaman Explore (`explore_feed`) — Feed Rekomendasi General
**Tujuan:** Menampilkan inspirasi & rekomendasi destinasi/UMKM secara general (lintas wilayah, topik tren, & pilihan editor) untuk pengguna yang ingin mencari ide perjalanan tanpa terbatas lokasi terdekat saat ini.

- **Hero Curated Banner:** Slider destinasi pilihan minggu ini / *editor's choice*.
- **Promoted/Sponsored Carousel:** Slot khusus UMKM beriklan yang direkomendasikan secara nasional/regional.
- **Trending Categories Grid:** Kategori populer (misal: *Hidden Beaches, Heritage Coffee, Cultural Village*).
- **Community Stories & Highlights:** Feed cerita perjalanan dari kontributor teratas (*Local Champions*).

---

### 3.2 Halaman Explore Map (`explore_map`) — Berbasis Lokasi Terdekat
**Tujuan:** Eksplorasi hidden gems dan UMKM secara visual berbasis koordinat pengguna.

- **Map Engine:** Terintegrasi dengan **OpenStreetMap** (LeafletJS / MapLibre GL).
- **Floating Search Bar & Category Chips:** Filter meliputi Kuliner, Wisata Alam, Budaya, dan **Promoted/Sponsor**.
- **Interactive Pins:** 
  - Pin hijau standar untuk hidden gem biasa.
  - **Pin Glowing berbingkai "SPONSORED"** untuk UMKM yang beriklan.
- **Peek Card Preview:** Menampilkan informasi tempat, jarak (*0.2 km away*), dan rating saat pin di-tap.

---

### 3.3 Halaman Hidden Gem & UMKM Detail (`detail_tempat`)
**Tujuan:** Menampilkan informasi lengkap destinasi atau UMKM.

- **Hero Section:** Banner foto dengan efek zoom on hover, judul tempat, metadata lokasi, dan badge ("HIDDEN GEM" atau "DIPROMOSIKAN").
- **Audio Story Player:** Narasi audio folklore/guide story dengan UI equalizer sederhana (HTML5 Audio).
- **Location & Map Section:** Peta minimap (OpenStreetMap) dan link "Buka di Maps".
- **Top Regional Contributors:** Menampilkan daftar 3 pengguna dengan kontribusi terbanyak di wilayah tempat tersebut berada.
- **Merchant Contact Section (Khusus UMKM):** Tombol aksi cepat "Hubungi via WhatsApp / Telepon" dan tampilan katalog produk.
- **Traveler Reviews:** Daftar ulasan dan tips dari pengunjung lain.

---

### 3.4 Halaman Awards & Pencapaian (`awards_pencapaian`)
**Tujuan:** Pusat gamifikasi komunitas berbasis wilayah.

- **Papan Peringkat Kontributor Wilayah (Regional Leaderboard):**
  - **Filter Wilayah:** Dropdown Pemilih Wilayah (contoh: *Semua Wilayah*, *Yogyakarta*, *Ubud*).
  - Peringkat ditentukan berdasarkan **Total Kontribusi Valid** (jumlah hidden gem, ulasan, dan foto di wilayah tersebut).
- **Hero Level & XP Card:** Menampilkan akumulasi XP dari kontribusi dan target rank selanjutnya.
- **Badge Collection:** Grid koleksi lencana pencapaian komunitas.

---

### 3.5 Halaman Profil & Otentikasi (`profil_pengguna`)
**Tujuan:** Dashboard akun pengguna dan pintu masuk ekosistem merchant.

- **Otentikasi (Login/Signup):** Menggunakan **Google OAuth** (SSO 1-click login).
- **Profile Card:** Avatar, Nama (tersinkronisasi dari Google), gelar kontributor wilayah, dan progress bar XP.
- **Stats Bento Grid:** Total kontribusi lokasi, foto, dan rating.
- **Merchant Center Entry Point:** Banner ajakan "Daftarkan Usaha & Pasang Iklan" atau tombol masuk ke Dashboard Merchant jika sudah terdaftar.

---

### 3.6 Flow Tambah Kontribusi Community (`tambah_kontribusi`)
**Tujuan:** Form ringkas bagi traveler untuk mengirimkan usulan hidden gem baru.

1. **Langkah 1: Syarat & Ketentuan (S&K)**
   - Membaca aturan komunitas (foto asli, tempat otentik, dll). Checkbox persetujuan.
2. **Langkah 2: Isi Formulir Tempat**
   - Input nama, kategori, deskripsi/cerita, penentuan titik lokasi (OpenStreetMap), dan upload media (Maks 10 foto/video).
3. **Langkah 3: Submit & Menunggu Persetujuan Admin**
   - Halaman konfirmasi bahwa data terkirim. XP (+50) akan ditambahkan otomatis jika disetujui Admin melalui Backoffice.

---

### 3.7 Flow Registrasi & Iklan Merchant UMKM (`registrasi_merchant`)
**Tujuan:** Form bagi pemilik usaha untuk mendaftar, mengisi katalog, dan mengaktifkan iklan.

1. **Langkah 1: Syarat & Ketentuan (S&K)**
   - Aturan pendaftaran usaha dan penjelasan paket promosi/iklan berbasis **1 Hari (Daily Ad)**.
2. **Langkah 2: Mengisi Form Usaha & Lokasi**
   - Input profil usaha, kategori, kontak WhatsApp, dan penentuan titik koordinat peta (OpenStreetMap).
3. **Langkah 3: Mengisi Katalog Produk**
   - Input item produk unggulan (foto, nama, harga, deskripsi) dan foto cover toko.
4. **Langkah 4: Submit & Instruksi Pembayaran Iklan**
   - Menampilkan rincian tagihan paket iklan harian dan nomor rekening bank manual jajal.in.
   - Merchant mengunggah foto/screenshot bukti transfer.
   - Status menjadi `Pending Approval` hingga Admin memverifikasi usaha dan dana masuk.

---

### 3.8 Fitur Iklan UMKM (Daily Promoted Listing)
- **Sistem Sewa:** Berbasis **30 Hari**.
- **Keuntungan Iklan:**
  - Pin Marker menyala (*Glowing Pin*) dengan pita "SPONSORED" pada Map.
  - Prioritas urutan teratas pada feed pencarian dan carousel Explore.
- **Kadaluwarsa Otomatis:** Sistem backend (Cron Job) akan otomatis mencabut status *Sponsored* dan mengembalikannya menjadi *Organic* setelah durasi hari habis.

---

## 4. Stack Teknologi & Arsitektur

Platform dibangun dengan arsitektur modern web-first yang memisahkan frontend dan backend untuk skalabilitas dan performa.

### 4.1 Frontend (Client-Side)
- **Framework:** **Next.js** (React) dengan App Router untuk Server-Side Rendering (SSR) parsial dan optimasi SEO.
- **Styling:** **Tailwind CSS** (implementasi Design System Vivid Explorer).
- **Map Library:** **Leaflet.js / MapLibre GL** (mengonsumsi tile dari OpenStreetMap).
- **PWA:** Dukungan offline cache dasar dan installability via browser.

### 4.2 Backend & API (Server-Side)
- **Framework:** **Express.js** (Node.js/TypeScript) untuk menangani *custom logic*, verifikasi manual, dan pemrosesan data (seperti Cron Job reset status iklan UMKM harian).
- **Task Scheduler:** **Node-Cron** di dalam Express untuk eksekusi tugas background (kadaluwarsa Promoted Listing).

### 4.3 Database & Authentication (BaaS/Data Layer)
- **Platform:** **Supabase**
- **Database:** **PostgreSQL** dengan ekstensi **PostGIS** untuk kalkulasi *spatial data* (radius koordinat, titik peta, proximity).
- **Authentication:** **Supabase Auth / NextAuth** terintegrasi secara native dengan **Google OAuth** untuk proses login tanpa friksi.
- **Storage:** **Supabase Storage** untuk menyimpan file unggahan gambar (katalog UMKM, foto kontribusi) dengan pengelolaan akses URL publik.

---

## 5. Design System — Vivid Explorer

- **Filosofi:** Minimalis, High-Contrast Modernism, whitespace generus.
- **Warna Utama:** `#A3E635` (Lime Green — Primary), `#1F2937` (Slate — Secondary), `#F3F4F6` (Background).
- **Warna Iklan (Sponsor):** Kombinasi Lime Green dengan efek glow shadow, pita/teks kontras untuk menyorot elemen berbayar.
- **Tipografi:** **Space Grotesk** (Headings, bold/futuristik) & **Inter** (Body/Labels, legibilitas tinggi).
- **Komponen UI:** Border radius 22px (`rounded-brand`), Glassmorphism untuk elemen *floating*, Material Symbols Outlined untuk ikonografi.

---

## 6. Persyaratan Non-Fungsional

- **Responsivitas:** Mobile-first design, adaptive layout untuk tablet dan desktop.
- **Aksesibilitas:** Kontras warna memenuhi standar WCAG AA.
- **Lokalisasi:** UI utama Bahasa Indonesia, konten destinasi bisa bilingual (ID/EN).
- **Dashboard Admin (Backoffice):** Aplikasi internal (terpisah atau dilindungi role admin) yang digunakan tim operasional jajal.in untuk:
  1. Meninjau usulan Hidden Gem baru.
  2. Memverifikasi validitas merchant UMKM.
  3. Memeriksa mutasi bank manual dan meng-approve status iklan merchant.

---

## 7. Open Items & Keputusan Tertunda

| # | Item | Status |
|---|---|---|
| 1 | Nominal harga paket iklan per 30 hari (Daily Ad Rate) | ⏳ Skipped / Ditunda |
| 2 | Pengaturan ambang batas approval otomatis vs manual admin untuk kontribusi | ⏳ Skipped / Ditunda |
| 3 | Dark mode color token mapping | ⏳ Skipped / Ditunda |