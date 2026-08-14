# Rencana Implementasi: Fitur Region Berbasis Kabupaten/Kota (Hierarkis & Auto-Detect)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Memperbaiki dan menyempurnakan fitur region agar merepresentasikan Kabupaten/Kota secara akurat dengan relasi hierarkis (Provinsi &rarr; Kabupaten/Kota), deteksi otomatis dari koordinat peta (reverse geocoding), serta integrasi form input dan filter leaderboard.

**Architecture:** Menggunakan struktur tabel `regions` dengan relasi `parent_id` (Provinsi &rarr; Kabupaten/Kota). Backend menyediakan endpoint `GET /api/regions` dan utilitas reverse geocoding untuk deteksi Kabupaten/Kota dari koordinat Nominatim. Frontend memanfaatkan data API dan `LocationPicker` untuk deteksi otomatis serta seleksi manual di form kontribusi, registrasi merchant, dan leaderboard.

**Tech Stack:** Express.js, TypeScript, Supabase PostgreSQL, Jest, Next.js 14 App Router, Tailwind CSS, Leaflet.js / OpenStreetMap Nominatim.

## Global Constraints
- Mengikuti aturan migrasi: setiap perubahan struktur database WAJIB di `backend/migrations/` dengan format penamaan `YYYYMMDD_HHMMSS_deskripsi.sql`.
- Mengikuti konvensi Clean Code: pemisahan route &rarr; controller &rarr; service &rarr; utils.
- Menjaga konsistensi token desain Vivid Explorer pada frontend.
- Tidak ada breaking changes pada endpoint API yang sudah ada.

---

### Task 1: Database Migration untuk Hierarki Region & Relasi Tempat
**Files:**
- Create: `backend/migrations/20260814_200000_seed_hierarchical_regions.sql`

**Interfaces:**
- Consumes: Skema tabel `regions` dan `places`
- Produces: Data seeded provinsi dan kabupaten/kota dengan relasi `parent_id` serta pembaruan relasi `places.region_id`

- [ ] **Step 1: Tulis file migrasi SQL**
Buat file `backend/migrations/20260814_200000_seed_hierarchical_regions.sql` berisi data provinsi dan kabupaten/kota (DIY, Jateng, Bali, DKI Jakarta, Jabar, Jatim) dan update relasi data `places` eksisting.

- [ ] **Step 2: Verifikasi sintaks SQL dan eksekusi lokal jika Supabase CLI aktif**

- [ ] **Step 3: Commit**
```bash
git add backend/migrations/20260814_200000_seed_hierarchical_regions.sql
git commit -m "feat(db): tambah migrasi hierarki region kabupaten/kota"
```

---

### Task 2: Backend Regions Service, Controller, Routes (`GET /api/regions`)
**Files:**
- Create: `backend/src/services/regionsService.ts`
- Create: `backend/src/controllers/regionsController.ts`
- Create: `backend/src/routes/regions.ts`
- Modify: `backend/src/app.ts`
- Test: `backend/src/services/regionsService.test.ts`
- Test: `backend/src/controllers/regionsController.test.ts`

**Interfaces:**
- Consumes: Supabase client
- Produces: `GET /api/regions` (mendukung filter `?parentId=...` dan format grouped `?grouped=true`)

- [ ] **Step 1: Tulis unit test untuk regionsService & regionsController**
- [ ] **Step 2: Jalankan test untuk memverifikasi kegagalan (RED)**
- [ ] **Step 3: Implementasikan service, controller, dan routes**
- [ ] **Step 4: Mount route di `backend/src/app.ts`**
- [ ] **Step 5: Jalankan test untuk memverifikasi kelulusan (GREEN)**
- [ ] **Step 6: Commit**
```bash
git add backend/src/services/regionsService.ts backend/src/controllers/regionsController.ts backend/src/routes/regions.ts backend/src/app.ts backend/src/services/regionsService.test.ts backend/src/controllers/regionsController.test.ts
git commit -m "feat(backend): implementasi endpoint GET /api/regions"
```

---

### Task 3: Peningkatan Geocoding & Resolusi Otomatis Kabupaten/Kota
**Files:**
- Modify: `backend/src/utils/geocoding.ts`
- Modify: `backend/src/services/contributionsService.ts`
- Modify: `backend/src/services/merchantService.ts`
- Test: `backend/src/utils/geocoding.test.ts`
- Test: `backend/src/services/contributionsService.test.ts`
- Test: `backend/src/services/merchantService.test.ts`

**Interfaces:**
- Consumes: OpenStreetMap Nominatim JSON format
- Produces: `getDistrictCityFromCoordinates(lat, lng)` dan `resolveRegionFromCoordinates(lat, lng)`

- [ ] **Step 1: Tambah test case untuk ekstraksi kabupaten/kota di `geocoding.test.ts`**
- [ ] **Step 2: Implementasi ekstraksi `county`/`city` dan normalisasi nama di `geocoding.ts`**
- [ ] **Step 3: Hubungkan fallback auto-resolve region di `contributionsService.ts` & `merchantService.ts`**
- [ ] **Step 4: Jalankan seluruh test suite geocoding dan services**
- [ ] **Step 5: Commit**
```bash
git add backend/src/utils/geocoding.ts backend/src/services/contributionsService.ts backend/src/services/merchantService.ts backend/src/utils/geocoding.test.ts backend/src/services/contributionsService.test.ts backend/src/services/merchantService.test.ts
git commit -m "feat(backend): tambah deteksi otomatis kabupaten/kota via reverse geocoding"
```

---

### Task 4: Frontend API Client & LocationPicker Geocoding Callback
**Files:**
- Modify: `frontend/src/lib/api-client.ts`
- Modify: `frontend/src/lib/types.ts`
- Modify: `frontend/src/components/map/LocationPicker.tsx`

**Interfaces:**
- Consumes: `GET /api/regions` dari backend
- Produces: `regionsApi.getAll()`, `regionsApi.getGrouped()`, dan `onLocationSelect` callback di `LocationPicker`

- [ ] **Step 1: Perbarui tipe data `Region` & definisikan `regionsApi` di `api-client.ts`**
- [ ] **Step 2: Tambahkan callback geocoding di `LocationPicker.tsx` saat marker dipindahkan**
- [ ] **Step 3: Verifikasi tipe data via `npm run typecheck` di frontend**
- [ ] **Step 4: Commit**
```bash
git add frontend/src/lib/api-client.ts frontend/src/lib/types.ts frontend/src/components/map/LocationPicker.tsx
git commit -m "feat(frontend): integrasi API regions dan geocoding callback di LocationPicker"
```

---

### Task 5: Frontend Form Kontribusi (`/post`) & Registrasi Merchant (`/register-merchant`)
**Files:**
- Modify: `frontend/src/app/post/page.tsx`
- Modify: `frontend/src/app/register-merchant/page.tsx`

**Interfaces:**
- Consumes: `LocationPicker`, `regionsApi.getAll()`, `contributionsApi.create()`, `merchantApi.register()`
- Produces: Form interaktif dengan auto-detected Kabupaten/Kota dan pemilih manual

- [ ] **Step 1: Update form `/post` dengan indikator deteksi Kabupaten/Kota dan dropdown pilihan wilayah dinamis**
- [ ] **Step 2: Pasang `LocationPicker` dan selector wilayah dinamis pada form `/register-merchant`**
- [ ] **Step 3: Validasi alur pengiriman `regionId` aktual ke backend**
- [ ] **Step 4: Jalankan `npm run typecheck`**
- [ ] **Step 5: Commit**
```bash
git add frontend/src/app/post/page.tsx frontend/src/app/register-merchant/page.tsx
git commit -m "feat(frontend): integrasi pemilih kabupaten/kota pada form post dan register merchant"
```

---

### Task 6: Frontend Leaderboard Awards (`/awards`) & Konsistensi Tampilan
**Files:**
- Modify: `frontend/src/app/awards/page.tsx`
- Modify: `frontend/src/app/detail/[id]/page.tsx`

**Interfaces:**
- Consumes: `regionsApi.getAll()`, `awardsApi.getLeaderboard(regionId)`
- Produces: Dynamic region filter pada Leaderboard dan label Kabupaten/Kota yang konsisten

- [ ] **Step 1: Tambahkan dropdown pemilih Kabupaten/Kota di halaman `/awards` terhubung ke `awardsApi.getLeaderboard`**
- [ ] **Step 2: Pastikan halaman detail menampilkan nama Kabupaten/Kota yang tepat**
- [ ] **Step 3: Verifikasi tampilan dan responsive behavior**
- [ ] **Step 4: Commit**
```bash
git add frontend/src/app/awards/page.tsx frontend/src/app/detail/[id]/page.tsx
git commit -m "feat(frontend): filter wilayah dinamis di leaderboard awards"
```

---

### Task 7: Verifikasi Menyeluruh & Full Test Suite
**Files:**
- Seluruh file proyek terkait

- [ ] **Step 1: Jalankan test backend (`npm test` di backend)**
- [ ] **Step 2: Jalankan typecheck & lint frontend (`npm run typecheck` dan `npm run lint` di frontend)**
- [ ] **Step 3: Verifikasi manual alur keseluruhan**
- [ ] **Step 4: Buat walkthrough dokumentasi**
