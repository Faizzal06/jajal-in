import { Region, Category } from '../types';

export const regions: Region[] = [
  { id: 'semua', name: 'Semua Wilayah', slug: 'semua' },
  { id: '22222222-2222-2222-2222-222222222222', name: 'Yogyakarta', slug: 'yogyakarta' },
  { id: '11111111-1111-1111-1111-111111111111', name: 'Pekalongan', slug: 'pekalongan' },
  { id: '33333333-3333-3333-3333-333333333333', name: 'Semarang', slug: 'semarang' },
];

export const categories: Category[] = [
  { id: 'c1111111-1111-1111-1111-111111111111', name: 'Kuliner', slug: 'kuliner', applicableTo: 'both', icon: 'restaurant' },
  { id: 'c4444444-4444-4444-4444-444444444444', name: 'Wisata Alam', slug: 'wisata-alam', applicableTo: 'gem', icon: 'forest' },
  { id: 'c5555555-5555-5555-5555-555555555555', name: 'Budaya & Sejarah', slug: 'budaya-sejarah', applicableTo: 'both', icon: 'museum' },
  { id: 'c3333333-3333-3333-3333-333333333333', name: 'Kopi & Cafe', slug: 'kopi-cafe', applicableTo: 'both', icon: 'coffee' },
  { id: 'c2222222-2222-2222-2222-222222222222', name: 'Kerajinan', slug: 'kerajinan', applicableTo: 'merchant', icon: 'palette' },
];
