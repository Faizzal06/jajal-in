-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS regions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    parent_id UUID REFERENCES regions(id)
);

CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    applicable_to TEXT NOT NULL,
    icon TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number INT NOT NULL,
    name TEXT NOT NULL,
    xp_required INT NOT NULL
);

-- Users profile table linking to Supabase auth.users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY, -- Should map to auth.users in actual Supabase instance
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'user',
    total_xp INT DEFAULT 0,
    region_id UUID REFERENCES regions(id),
    level_id UUID REFERENCES levels(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS places (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('gem', 'merchant')),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    location GEOGRAPHY(Point, 4326) NOT NULL,
    region_id UUID REFERENCES regions(id),
    category_id UUID REFERENCES categories(id),
    owner_id UUID REFERENCES users(id),
    status TEXT NOT NULL DEFAULT 'pending',
    is_sponsored BOOLEAN DEFAULT false,
    sponsored_until TIMESTAMP WITH TIME ZONE,
    contact_whatsapp TEXT,
    contact_phone TEXT,
    rating FLOAT DEFAULT 0,
    review_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Indeks spasial untuk mempercepat pencarian radius
CREATE INDEX IF NOT EXISTS places_location_idx ON places USING GIST (location);

CREATE TABLE IF NOT EXISTS place_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    place_id UUID REFERENCES places(id),
    media_type TEXT NOT NULL,
    url TEXT NOT NULL,
    caption TEXT
);

CREATE TABLE IF NOT EXISTS audio_stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    place_id UUID REFERENCES places(id),
    title TEXT NOT NULL,
    narrator TEXT NOT NULL,
    duration TEXT,
    url TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    place_id UUID REFERENCES places(id),
    user_id UUID REFERENCES users(id),
    rating INT NOT NULL,
    text TEXT NOT NULL,
    is_tip BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    place_id UUID REFERENCES places(id),
    name TEXT NOT NULL,
    price FLOAT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT
);

CREATE TABLE IF NOT EXISTS ad_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    duration_days INT NOT NULL,
    price_idr FLOAT NOT NULL,
    description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ad_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    place_id UUID REFERENCES places(id),
    ad_package_id UUID REFERENCES ad_packages(id),
    bank_account_id UUID,
    amount FLOAT NOT NULL,
    proof_url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    criterion_type TEXT NOT NULL,
    criterion_value INT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    badge_id UUID REFERENCES badges(id),
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
