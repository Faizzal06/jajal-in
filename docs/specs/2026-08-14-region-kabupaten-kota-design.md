# Desain Teknis: Fitur Region Berbasis Kabupaten/Kota (Hierarkis & Auto-Detect)

## 1. Ringkasan
Dokumen ini mendefinisikan perubahan arsitektur dan fungsionalitas untuk fitur **Region** di jajal.in agar merepresentasikan **Kabupaten/Kota** secara tepat dengan struktur hierarkis (Provinsi &rarr; Kabupaten/Kota) serta kemampuan deteksi otomatis (*auto-detect reverse geocoding*) dari titik koordinat OpenStreetMap.

---

## 2. Struktur Data & Skema Database

### 2.1 Model Hierarkis Tabel `regions`
Tabel `regions` yang sudah ada dimanfaatkan secara penuh dengan struktur berikut:
- **Level 1 (Provinsi)**: Record dengan `parent_id IS NULL`.
- **Level 2 (Kabupaten / Kota)**: Record dengan `parent_id` merujuk ke ID provinsi induknya.

### 2.2 Migrasi SQL (`backend/migrations/20260814_200000_seed_hierarchical_regions.sql`)
- Menambahkan data standar provinsi dan kabupaten/kota untuk wilayah operasional utama:
  - **DI Yogyakarta**: Kota Yogyakarta, Kabupaten Sleman, Kabupaten Bantul, Kabupaten Gunungkidul, Kabupaten Kulon Progo.
  - **Jawa Tengah**: Kota Pekalongan, Kabupaten Pekalongan, Kota Semarang, Kabupaten Semarang, Kota Surakarta, Kabupaten Batang, Kabupaten Magelang, Kabupaten Banyumas, dll.
  - **Bali**: Kota Denpasar, Kabupaten Badung, Kabupaten Gianyar, Kabupaten Tabanan, dll.
  - **DKI Jakarta**: Kota Jakarta Pusat, Kota Jakarta Selatan, Kota Jakarta Barat, Kota Jakarta Timur, Kota Jakarta Utara, Kabupaten Kepulauan Seribu.
  - **Jawa Barat**: Kota Bandung, Kabupaten Bandung, Kota Bogor, Kabupaten Bogor, dll.
  - **Jawa Timur**: Kota Surabaya, Kota Malang, Kabupaten Malang, Kota Batu, dll.
- Memperbarui relasi `region_id` pada entri `places` eksisting agar merujuk ke Kabupaten/Kota spesifik.

---

## 3. Backend Architecture & API

### 3.1 Endpoint Baru: `GET /api/regions`
- **Controller**: `backend/src/controllers/regionsController.ts`
- **Service**: `backend/src/services/regionsService.ts`
- **Routes**: `backend/src/routes/regions.ts` dimount di `/api/regions` pada `backend/src/app.ts`
- **Query Params**:
  - `grouped=true`: Mengembalikan daftar kabupaten/kota yang dikelompokkan berdasarkan provinsi induknya.
  - `parentId=<uuid>`: Mengembalikan daftar kabupaten/kota di bawah provinsi tertentu.
  - Default: Mengembalikan seluruh data regions aktif beserta informasi parent.

### 3.2 Peningkatan Utilitas Reverse Geocoding (`backend/src/utils/geocoding.ts`)
- Memperluas pemrosesan respon Nominatim OSM:
  - Mengambil field `county`, `city`, `town`, `municipality`, `state`.
  - Normalisasi nama Kabupaten/Kota (contoh: "Gunung Kidul Regency" &rarr; "Kabupaten Gunungkidul", "City of Yogyakarta" &rarr; "Kota Yogyakarta").
- Fungsi helper `resolveRegionFromCoordinates(lat, lng)` untuk mencari `region_id` yang sesuai di database berdasarkan nama kabupaten/kota atau provinsi hasil geocoding.

### 3.3 Penyesuaian `contributionsService` & `merchantService`
- Menerima `regionId` dari form input pengguna.
- Jika `regionId` kosong atau belum valid, sistem secara otomatis melakukan resolusi `region_id` berdasarkan koordinat `lat` & `lng` tempat.

---

## 4. Frontend Architecture & Komponen UI

### 4.1 Peningkatan `LocationPicker` (`frontend/src/components/map/LocationPicker.tsx`)
- Mengirimkan event callback saat koordinat berubah, termasuk data hasil reverse geocoding (alamat lengkap dan nama Kabupaten/Kota yang terdeteksi).

### 4.2 Form Tambah Kontribusi (`frontend/src/app/post/page.tsx`)
- Menampilkan indikator Kabupaten/Kota terdeteksi secara visual (`📍 Terdeteksi: Kota Pekalongan`).
- Menyediakan dropdown pilihan Kabupaten/Kota (dikelompokkan per provinsi) yang terisi dinamis dari `GET /api/regions`.
- Mengirimkan `regionId` aktual yang valid ke endpoint `POST /api/contributions`.

### 4.3 Form Registrasi Merchant (`frontend/src/app/register-merchant/page.tsx`)
- Mengintegrasikan `LocationPicker` untuk pemilihan titik lokasi UMKM.
- Menampilkan selector Kabupaten/Kota dinamis dan mengirimkan koordinat serta `regionId` yang valid ke `POST /api/merchant/register`.

### 4.4 Halaman Awards & Leaderboard (`frontend/src/app/awards/page.tsx`)
- Menambahkan filter dropdown Wilayah (Kabupaten/Kota) pada tabel Leaderboard yang mengambil daftar wilayah dari API `GET /api/regions`.
- Memanggil `GET /api/awards/leaderboard?regionId=...` saat pengguna memilih wilayah tertentu.

### 4.5 Tampilan Feed, Map, & Detail Tempat
- Memastikan badge dan label wilayah menampilkan nama Kabupaten/Kota secara konsisten di seluruh kartu dan halaman detail.

---

## 5. Rencana Pengujian & Verifikasi
1. **Backend Tests**:
   - Unit & integration tests untuk `GET /api/regions` (`backend/src/controllers/regionsController.test.ts` dan `backend/src/services/regionsService.test.ts`).
   - Unit tests untuk reverse geocoding parser dan helper `resolveRegionFromCoordinates`.
   - Menjalankan seluruh test suite backend (`npm test`) memastikan tidak ada regresi.
2. **Frontend Verification**:
   - `npm run typecheck` dan `npm run lint` di frontend bebas error.
   - Verifikasi interaksi di form `/post`, `/register-merchant`, `/awards`, dan halaman detail tempat.
