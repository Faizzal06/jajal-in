import { Region, Category } from '../types';

export const regions: Region[] = [
  { id: 'semua', name: 'Semua Wilayah', slug: 'semua' },
  { id: '20000001-0000-0000-0000-000000000001', name: 'Kota Yogyakarta', slug: 'kota-yogyakarta', parentId: '10000000-0000-0000-0000-000000000001' },
  { id: '20000001-0000-0000-0000-000000000002', name: 'Kabupaten Sleman', slug: 'kabupaten-sleman', parentId: '10000000-0000-0000-0000-000000000001' },
  { id: '20000001-0000-0000-0000-000000000003', name: 'Kabupaten Bantul', slug: 'kabupaten-bantul', parentId: '10000000-0000-0000-0000-000000000001' },
  { id: '20000001-0000-0000-0000-000000000004', name: 'Kabupaten Gunungkidul', slug: 'kabupaten-gunungkidul', parentId: '10000000-0000-0000-0000-000000000001' },
  { id: '11111111-1111-1111-1111-111111111111', name: 'Kota Pekalongan', slug: 'pekalongan', parentId: '10000000-0000-0000-0000-000000000002' },
  { id: '20000002-0000-0000-0000-000000000001', name: 'Kabupaten Pekalongan', slug: 'kabupaten-pekalongan', parentId: '10000000-0000-0000-0000-000000000002' },
  { id: '33333333-3333-3333-3333-333333333333', name: 'Kota Semarang', slug: 'semarang', parentId: '10000000-0000-0000-0000-000000000002' },
  { id: '20000003-0000-0000-0000-000000000002', name: 'Kabupaten Badung', slug: 'kabupaten-badung', parentId: '10000000-0000-0000-0000-000000000003' },
  { id: '20000003-0000-0000-0000-000000000003', name: 'Kabupaten Gianyar', slug: 'kabupaten-gianyar', parentId: '10000000-0000-0000-0000-000000000003' },
];

export const categories: Category[] = [
  { id: 'c1111111-1111-1111-1111-111111111111', name: 'Kuliner', slug: 'kuliner', applicableTo: 'both', icon: 'restaurant' },
  { id: 'c4444444-4444-4444-4444-444444444444', name: 'Wisata Alam', slug: 'wisata-alam', applicableTo: 'gem', icon: 'forest' },
  { id: 'c5555555-5555-5555-5555-555555555555', name: 'Budaya & Sejarah', slug: 'budaya-sejarah', applicableTo: 'both', icon: 'museum' },
  { id: 'c3333333-3333-3333-3333-333333333333', name: 'Kopi & Cafe', slug: 'kopi-cafe', applicableTo: 'both', icon: 'coffee' },
  { id: 'c2222222-2222-2222-2222-222222222222', name: 'Kerajinan', slug: 'kerajinan', applicableTo: 'merchant', icon: 'palette' },
];
