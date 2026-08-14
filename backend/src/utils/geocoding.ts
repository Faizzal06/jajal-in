/**
 * Utility for reverse geocoding coordinates to an address and resolving administrative regions using OpenStreetMap Nominatim API
 */
import { supabase } from '../lib/supabase';

export interface DetailedAddress {
  displayName: string | null;
  cityOrRegency: string | null;
  province: string | null;
}

export function normalizeRegencyName(name: string): string {
  let cleaned = name.trim();

  // Normalize "Gunung Kidul" -> "Gunungkidul"
  cleaned = cleaned.replace(/Gunung\s+Kidul/gi, 'Gunungkidul');
  cleaned = cleaned.replace(/Kulon\s+Progo/gi, 'Kulon Progo');

  // If matches "City of X" or "X City"
  if (/^City of /i.test(cleaned)) {
    return `Kota ${cleaned.replace(/^City of /i, '').trim()}`;
  }
  if (/ City$/i.test(cleaned)) {
    return `Kota ${cleaned.replace(/ City$/i, '').trim()}`;
  }

  // If matches "X Regency"
  if (/ Regency$/i.test(cleaned)) {
    return `Kabupaten ${cleaned.replace(/ Regency$/i, '').trim()}`;
  }

  // If already starts with "Kabupaten" or "Kota"
  if (/^Kabupaten /i.test(cleaned) || /^Kota /i.test(cleaned)) {
    return cleaned;
  }

  return cleaned;
}

export async function getDetailedAddressFromCoordinates(
  lat: number,
  lng: number
): Promise<DetailedAddress> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(
      lat
    )}&lon=${encodeURIComponent(lng)}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'JajalInApp/1.0 (contact@jajal.in)',
        'Accept-Language': 'id,en;q=0.9',
      },
    });

    if (!response.ok) {
      console.error(
        `Nominatim geocoding failed with status: ${response.status} ${response.statusText}`
      );
      return { displayName: null, cityOrRegency: null, province: null };
    }

    const data = (await response.json()) as {
      display_name?: string;
      address?: {
        city?: string;
        town?: string;
        municipality?: string;
        county?: string;
        state_district?: string;
        state?: string;
      };
    };

    const rawCityOrRegency =
      data.address?.city ||
      data.address?.town ||
      data.address?.municipality ||
      data.address?.county ||
      data.address?.state_district ||
      null;

    const cityOrRegency = rawCityOrRegency ? normalizeRegencyName(rawCityOrRegency) : null;
    const province = data.address?.state || null;

    return {
      displayName: data.display_name || null,
      cityOrRegency,
      province,
    };
  } catch (error) {
    console.error('Error fetching detailed address from Nominatim:', error);
    return { displayName: null, cityOrRegency: null, province: null };
  }
}

export async function getAddressFromCoordinates(
  lat: number,
  lng: number
): Promise<string | null> {
  const result = await getDetailedAddressFromCoordinates(lat, lng);
  return result.displayName;
}

export async function resolveRegionFromCoordinates(
  lat: number,
  lng: number
): Promise<string | null> {
  try {
    const { cityOrRegency, province } = await getDetailedAddressFromCoordinates(lat, lng);

    if (cityOrRegency) {
      // Clean regency name to search in DB, e.g. "Kota Pekalongan" -> "Pekalongan"
      const keyword = cityOrRegency.replace(/^(Kabupaten|Kota)\s+/i, '').trim();

      const { data: regencyMatch } = await supabase
        .from('regions')
        .select('id')
        .ilike('name', `%${keyword}%`)
        .maybeSingle();

      if (regencyMatch?.id) {
        return regencyMatch.id;
      }
    }

    if (province) {
      const provKeyword = province.replace(/^(Daerah Khusus Ibukota|Daerah Istimewa|Provinsi)\s+/i, '').trim();
      const { data: provMatch } = await supabase
        .from('regions')
        .select('id')
        .ilike('name', `%${provKeyword}%`)
        .maybeSingle();

      if (provMatch?.id) {
        return provMatch.id;
      }
    }

    return null;
  } catch (err) {
    console.error('Error resolving region from coordinates:', err);
    return null;
  }
}
