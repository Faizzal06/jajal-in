-- Migration: Create site_settings table for dynamic configurable site content (Hero banner, etc.)
-- Date: 2026-08-18 00:00:00

CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL DEFAULT '',
    updated_at TIMESTAMPTZ DEFAULT now(),
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Seed default settings for Hero Section
INSERT INTO site_settings (key, value) VALUES
    ('hero_badge', 'Vivid Explorer Mode'),
    ('hero_title', 'Radar UMKM'),
    ('hero_subtitle', 'Temukan permata tersembunyi dan produk lokal terbaik di sekitarmu dengan presisi tinggi.'),
    ('hero_image_url', '')
ON CONFLICT (key) DO NOTHING;
