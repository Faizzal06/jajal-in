export function parseEWKBPoint(wkbHex: string): { lat: number; lng: number } | null {
  if (!wkbHex || typeof wkbHex !== 'string') return null;
  // PostGIS EWKB Point format:
  // 01 (little endian)
  // 01000020 (Point with SRID)
  // E6100000 (SRID 4326 = 0x10E6)
  // X (8 bytes double)
  // Y (8 bytes double)
  if (wkbHex.length >= 42) {
    try {
      const buffer = Buffer.from(wkbHex, 'hex');
      const lng = buffer.readDoubleLE(9);
      const lat = buffer.readDoubleLE(17);
      return { lat, lng };
    } catch (err) {
      return null;
    }
  }
  return null;
}
