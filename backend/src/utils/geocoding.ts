/**
 * Utility for reverse geocoding coordinates to an address using OpenStreetMap Nominatim API
 */
export async function getAddressFromCoordinates(
  lat: number,
  lng: number
): Promise<string | null> {
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
      return null;
    }

    const data = (await response.json()) as { display_name?: string };
    return data.display_name || null;
  } catch (error) {
    console.error('Error fetching address from Nominatim:', error);
    return null;
  }
}
