-- Migration: Add address column to places table and update get_places_within_radius function

DROP FUNCTION get_places_within_radius(double precision, double precision, double precision);

ALTER TABLE places ADD COLUMN IF NOT EXISTS address TEXT;

CREATE OR REPLACE FUNCTION public.get_places_within_radius(
    user_lat FLOAT8,
    user_lon FLOAT8,
    radius_meters FLOAT8
)
RETURNS TABLE (
    id UUID,
    type TEXT,
    name TEXT,
    slug TEXT,
    description TEXT,
    address TEXT,
    lat FLOAT8,
    lng FLOAT8,
    region_name TEXT,
    category_name TEXT,
    category_icon TEXT,
    rating FLOAT,
    review_count INT,
    is_sponsored BOOLEAN,
    distance_meters FLOAT8
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.type,
        p.name,
        p.slug,
        p.description,
        p.address,
        ST_Y(p.location::geometry) AS lat,
        ST_X(p.location::geometry) AS lng,
        r.name AS region_name,
        c.name AS category_name,
        c.icon AS category_icon,
        p.rating,
        p.review_count,
        p.is_sponsored,
        ST_Distance(p.location, ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326)::geography) AS distance_meters
    FROM places p
    LEFT JOIN regions r ON p.region_id = r.id
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.status = 'approved'
      AND ST_DWithin(p.location, ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326)::geography, radius_meters)
    ORDER BY p.is_sponsored DESC, distance_meters ASC;
END;
$$;
