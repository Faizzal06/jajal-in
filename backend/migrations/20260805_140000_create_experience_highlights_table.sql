-- Create place_highlights table for storing experience highlights
CREATE TABLE IF NOT EXISTS place_highlights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    place_id UUID REFERENCES places(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT 'landscape'
);
