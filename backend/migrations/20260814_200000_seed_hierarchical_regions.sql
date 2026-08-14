-- Migration: Seed hierarchical regions (Provinces -> Regencies/Cities) and update existing places
-- Date: 2026-08-14 20:00:00

-- 1. SEED PROVINCES (parent_id IS NULL)
INSERT INTO regions (id, name, slug, parent_id) VALUES
    ('10000000-0000-0000-0000-000000000001', 'DI Yogyakarta', 'prov-di-yogyakarta', NULL),
    ('10000000-0000-0000-0000-000000000002', 'Jawa Tengah', 'prov-jawa-tengah', NULL),
    ('10000000-0000-0000-0000-000000000003', 'Bali', 'prov-bali', NULL),
    ('10000000-0000-0000-0000-000000000004', 'DKI Jakarta', 'prov-dki-jakarta', NULL),
    ('10000000-0000-0000-0000-000000000005', 'Jawa Barat', 'prov-jawa-barat', NULL),
    ('10000000-0000-0000-0000-000000000006', 'Jawa Timur', 'prov-jawa-timur', NULL)
ON CONFLICT (slug) DO NOTHING;

-- 2. SEED KABUPATEN / KOTA (parent_id references respective province)

-- DI Yogyakarta Regencies & Cities
INSERT INTO regions (id, name, slug, parent_id) VALUES
    ('20000001-0000-0000-0000-000000000001', 'Kota Yogyakarta', 'kota-yogyakarta', '10000000-0000-0000-0000-000000000001'),
    ('20000001-0000-0000-0000-000000000002', 'Kabupaten Sleman', 'kabupaten-sleman', '10000000-0000-0000-0000-000000000001'),
    ('20000001-0000-0000-0000-000000000003', 'Kabupaten Bantul', 'kabupaten-bantul', '10000000-0000-0000-0000-000000000001'),
    ('20000001-0000-0000-0000-000000000004', 'Kabupaten Gunungkidul', 'kabupaten-gunungkidul', '10000000-0000-0000-0000-000000000001'),
    ('20000001-0000-0000-0000-000000000005', 'Kabupaten Kulon Progo', 'kabupaten-kulon-progo', '10000000-0000-0000-0000-000000000001')
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, name = EXCLUDED.name;

-- Jawa Tengah Regencies & Cities
INSERT INTO regions (id, name, slug, parent_id) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Kota Pekalongan', 'pekalongan', '10000000-0000-0000-0000-000000000002'),
    ('20000002-0000-0000-0000-000000000001', 'Kabupaten Pekalongan', 'kabupaten-pekalongan', '10000000-0000-0000-0000-000000000002'),
    ('33333333-3333-3333-3333-333333333333', 'Kota Semarang', 'semarang', '10000000-0000-0000-0000-000000000002'),
    ('20000002-0000-0000-0000-000000000002', 'Kabupaten Semarang', 'kabupaten-semarang', '10000000-0000-0000-0000-000000000002'),
    ('20000002-0000-0000-0000-000000000003', 'Kota Surakarta', 'kota-surakarta', '10000000-0000-0000-0000-000000000002'),
    ('20000002-0000-0000-0000-000000000004', 'Kabupaten Batang', 'kabupaten-batang', '10000000-0000-0000-0000-000000000002'),
    ('20000002-0000-0000-0000-000000000005', 'Kabupaten Magelang', 'kabupaten-magelang', '10000000-0000-0000-0000-000000000002'),
    ('20000002-0000-0000-0000-000000000006', 'Kabupaten Banyumas', 'kabupaten-banyumas', '10000000-0000-0000-0000-000000000002')
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, name = EXCLUDED.name;

-- Bali Regencies & Cities
INSERT INTO regions (id, name, slug, parent_id) VALUES
    ('20000003-0000-0000-0000-000000000001', 'Kota Denpasar', 'kota-denpasar', '10000000-0000-0000-0000-000000000003'),
    ('20000003-0000-0000-0000-000000000002', 'Kabupaten Badung', 'kabupaten-badung', '10000000-0000-0000-0000-000000000003'),
    ('20000003-0000-0000-0000-000000000003', 'Kabupaten Gianyar', 'kabupaten-gianyar', '10000000-0000-0000-0000-000000000003'),
    ('20000003-0000-0000-0000-000000000004', 'Kabupaten Tabanan', 'kabupaten-tabanan', '10000000-0000-0000-0000-000000000003')
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, name = EXCLUDED.name;

-- DKI Jakarta Regencies & Cities
INSERT INTO regions (id, name, slug, parent_id) VALUES
    ('20000004-0000-0000-0000-000000000001', 'Kota Jakarta Pusat', 'kota-jakarta-pusat', '10000000-0000-0000-0000-000000000004'),
    ('20000004-0000-0000-0000-000000000002', 'Kota Jakarta Selatan', 'kota-jakarta-selatan', '10000000-0000-0000-0000-000000000004'),
    ('20000004-0000-0000-0000-000000000003', 'Kota Jakarta Barat', 'kota-jakarta-barat', '10000000-0000-0000-0000-000000000004'),
    ('20000004-0000-0000-0000-000000000004', 'Kota Jakarta Timur', 'kota-jakarta-timur', '10000000-0000-0000-0000-000000000004'),
    ('20000004-0000-0000-0000-000000000005', 'Kota Jakarta Utara', 'kota-jakarta-utara', '10000000-0000-0000-0000-000000000004'),
    ('20000004-0000-0000-0000-000000000006', 'Kabupaten Kepulauan Seribu', 'kabupaten-kepulauan-seribu', '10000000-0000-0000-0000-000000000004')
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, name = EXCLUDED.name;

-- Jawa Barat Regencies & Cities
INSERT INTO regions (id, name, slug, parent_id) VALUES
    ('20000005-0000-0000-0000-000000000001', 'Kota Bandung', 'kota-bandung', '10000000-0000-0000-0000-000000000005'),
    ('20000005-0000-0000-0000-000000000002', 'Kabupaten Bandung', 'kabupaten-bandung', '10000000-0000-0000-0000-000000000005'),
    ('20000005-0000-0000-0000-000000000003', 'Kota Bogor', 'kota-bogor', '10000000-0000-0000-0000-000000000005'),
    ('20000005-0000-0000-0000-000000000004', 'Kabupaten Bogor', 'kabupaten-bogor', '10000000-0000-0000-0000-000000000005')
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, name = EXCLUDED.name;

-- Jawa Timur Regencies & Cities
INSERT INTO regions (id, name, slug, parent_id) VALUES
    ('20000006-0000-0000-0000-000000000001', 'Kota Surabaya', 'kota-surabaya', '10000000-0000-0000-0000-000000000006'),
    ('20000006-0000-0000-0000-000000000002', 'Kota Malang', 'kota-malang', '10000000-0000-0000-0000-000000000006'),
    ('20000006-0000-0000-0000-000000000003', 'Kabupaten Malang', 'kabupaten-malang', '10000000-0000-0000-0000-000000000006'),
    ('20000006-0000-0000-0000-000000000004', 'Kota Batu', 'kota-batu', '10000000-0000-0000-0000-000000000006')
ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, name = EXCLUDED.name;

-- 3. UPDATE PLACES WITH PRECISE KABUPATEN / KOTA REGION_ID
-- Ensure existing Pekalongan places link to Kota Pekalongan
UPDATE places
SET region_id = '11111111-1111-1111-1111-111111111111'
WHERE slug IN ('batik-pesindon-pekalongan', 'nasi-megono-pak-tono', 'kopi-tahta-pekalongan', 'museum-batik-pekalongan', 'pantai-pasir-kencana');

-- Map any old Yogyakarta reference to Kota Yogyakarta or appropriate regency if matched
UPDATE places
SET region_id = '20000001-0000-0000-0000-000000000001'
WHERE region_id = '22222222-2222-2222-2222-222222222222';
