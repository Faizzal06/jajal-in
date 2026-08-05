-- Migration: Seed initial data for TemuLokal (Pekalongan & Jogja regions, categories, levels, places, products, ad_packages, badges)

-- 1. SEED REGIONS
INSERT INTO regions (id, name, slug) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Kota Pekalongan', 'pekalongan'),
    ('22222222-2222-2222-2222-222222222222', 'DI Yogyakarta', 'yogyakarta'),
    ('33333333-3333-3333-3333-333333333333', 'Kota Semarang', 'semarang')
ON CONFLICT (slug) DO NOTHING;

-- 2. SEED CATEGORIES
INSERT INTO categories (id, name, slug, applicable_to, icon) VALUES
    ('c1111111-1111-1111-1111-111111111111', 'Kuliner', 'kuliner', 'both', 'restaurant'),
    ('c2222222-2222-2222-2222-222222222222', 'Kerajinan & Batik', 'kerajinan', 'both', 'palette'),
    ('c3333333-3333-3333-3333-333333333333', 'Kopi & Cafe', 'kopi-cafe', 'both', 'coffee'),
    ('c4444444-4444-4444-4444-444444444444', 'Wisata Alam', 'wisata-alam', 'both', 'park'),
    ('c5555555-5555-5555-5555-555555555555', 'Budaya & Sejarah', 'budaya-sejarah', 'both', 'history_edu')
ON CONFLICT (slug) DO NOTHING;

-- 3. SEED LEVELS
INSERT INTO levels (number, name, xp_required) VALUES
    (1, 'Pemula', 0),
    (2, 'Penjelajah Lokal', 100),
    (3, 'Eksplorator', 300),
    (4, 'Master Guide', 1000)
ON CONFLICT DO NOTHING;

-- 4. SEED PLACES (PEKALONGAN & JOGJA GEMS/MERCHANTS)
INSERT INTO places (id, type, name, slug, description, location, region_id, category_id, status, is_sponsored, rating, review_count, contact_whatsapp) VALUES
    (
        'a1111111-1111-1111-1111-111111111111',
        'merchant',
        'Batik Pesindon Pekalongan',
        'batik-pesindon-pekalongan',
        'Pusat kerajinan batik tulis & cap khas Pekalongan dengan motif legendaris dan warna pesisiran yang cerah.',
        ST_SetSRID(ST_MakePoint(109.6753, -6.8898), 4326)::geography,
        '11111111-1111-1111-1111-111111111111',
        'c2222222-2222-2222-2222-222222222222',
        'approved',
        true,
        4.9,
        38,
        '6281234567890'
    ),
    (
        'a2222222-2222-2222-2222-222222222222',
        'merchant',
        'Nasi Megono Pak Tono Pekalongan',
        'nasi-megono-pak-tono',
        'Warung makan nasi megono asli Pekalongan dengan lauk lengkap megono nangka muda, tempe mendoan hangat, dan sambal terasi.',
        ST_SetSRID(ST_MakePoint(109.6720, -6.8875), 4326)::geography,
        '11111111-1111-1111-1111-111111111111',
        'c1111111-1111-1111-1111-111111111111',
        'approved',
        false,
        4.8,
        52,
        '6281987654321'
    ),
    (
        'a3333333-3333-3333-3333-333333333333',
        'gem',
        'Kopi Tahta Pekalongan',
        'kopi-tahta-pekalongan',
        'Kedai kopi bernuansa heritage di tengah kota Pekalongan dengan racikan arabika lokal dan suasana santai untuk nugas & nongkrong.',
        ST_SetSRID(ST_MakePoint(109.6780, -6.8920), 4326)::geography,
        '11111111-1111-1111-1111-111111111111',
        'c3333333-3333-3333-3333-333333333333',
        'approved',
        false,
        4.7,
        24,
        '6281122334455'
    ),
    (
        'a4444444-4444-4444-4444-444444444444',
        'gem',
        'Museum Batik Pekalongan',
        'museum-batik-pekalongan',
        'Cagar budaya dan museum internasional yang menyimpan koleksi batik terbaik dari seluruh nusantara.',
        ST_SetSRID(ST_MakePoint(109.6712, -6.8845), 4326)::geography,
        '11111111-1111-1111-1111-111111111111',
        'c5555555-5555-5555-5555-555555555555',
        'approved',
        true,
        4.9,
        120,
        '6281223344556'
    ),
    (
        'a5555555-5555-5555-5555-555555555555',
        'gem',
        'Pantai Pasir Kencana Pekalongan',
        'pantai-pasir-kencana',
        'Wisata bahari dengan pemandangan matahari terbenam spektakuler, skywalk, dan wahana rekreasi keluarga.',
        ST_SetSRID(ST_MakePoint(109.6640, -6.8620), 4326)::geography,
        '11111111-1111-1111-1111-111111111111',
        'c4444444-4444-4444-4444-444444444444',
        'approved',
        false,
        4.6,
        89,
        NULL
    )
ON CONFLICT (slug) DO NOTHING;

-- 5. SEED PRODUCTS FOR MERCHANTS
INSERT INTO products (place_id, name, price, description) VALUES
    ('a1111111-1111-1111-1111-111111111111', 'Kain Batik Tulis Jlamprang', 350000, 'Kain batik tulis motif Jlamprang khas Pekalongan berbahan katun primissima.'),
    ('a1111111-1111-1111-1111-111111111111', 'Kemeja Batik Cap Pria', 175000, 'Kemeja batik pria bahan halus dengan lapisan furing lembut.'),
    ('a2222222-2222-2222-2222-222222222222', 'Nasi Megono Komplit Pekalongan', 15000, 'Nasi hangat dengan topping megono gurih, mendoan 2 pcs, dan telur balado.'),
    ('a3333333-3333-3333-3333-333333333333', 'Es Kopi Susu Tahta', 22000, 'Signature iced coffee susu dengan gula aren organik khas Pekalongan.')
ON CONFLICT DO NOTHING;

-- 6. SEED AD PACKAGES
INSERT INTO ad_packages (name, duration_days, price_idr, description) VALUES
    ('Starter Paket 7 Hari', 7, 50000, 'Tampil di posisi atas hasil pencarian dan pin khusus sponsored selama 7 hari.'),
    ('Pro Paket 30 Hari', 30, 150000, 'Promosi penuh selama 1 bulan di feed explore dan halaman peta terdekat.'),
    ('Ultra Paket 90 Hari', 90, 350000, 'Paket hemat 3 bulan dengan badge rekomendasi khusus dan promosi prioritas.')
ON CONFLICT DO NOTHING;

-- 7. SEED BADGES
INSERT INTO badges (code, name, description, icon, criterion_type, criterion_value) VALUES
    ('first_gem', 'Penemu Pertama', 'Diberikan kepada kontributor yang membagikan lokasi hidden gem pertama kali.', 'explore', 'contributions', 1),
    ('culinary_master', 'Ahli Kuliner', 'Menulis minimal 5 ulasan kuliner lokal.', 'restaurant', 'reviews', 5),
    ('local_hero', 'Pahlawan UMKM', 'Merekomendasikan dan membantu registrasi 3 UMKM lokal.', 'storefront', 'merchants', 3)
ON CONFLICT (code) DO NOTHING;
