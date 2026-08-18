const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    headers,
    cache: 'no-store',
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `API ${res.status}: ${res.statusText}`);
  }

  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
};

export interface ExploreFeedResponse {
  id: string;
  type: string;
  name: string;
  slug: string;
  description: string;
  location: string;
  address?: string;
  lat?: number;
  lng?: number;
  rating: number;
  review_count: number;
  is_sponsored: boolean;
  status: string;
  contact_whatsapp?: string;
  contact_phone?: string;
  created_at: string;
  regions?: { name: string; slug?: string };
  categories?: { name: string; icon: string; applicable_to?: string };
  place_media?: { url: string; media_type?: string; caption?: string }[];
}

export interface ExploreMapResponse {
  id: string;
  name: string;
  slug: string;
  description: string;
  lat: number;
  lng: number;
  rating: number;
  review_count: number;
  is_sponsored: boolean;
  category_name?: string;
  category_icon?: string;
  region_name?: string;
  place_media?: { url: string; media_type?: string; caption?: string }[];
}

export interface PlaceDetailResponse {
  id: string;
  type: string;
  name: string;
  slug: string;
  description: string;
  location: string;
  address?: string;
  lat?: number;
  lng?: number;
  rating: number;
  review_count: number;
  is_sponsored: boolean;
  status: string;
  contact_whatsapp?: string;
  contact_phone?: string;
  created_at: string;
  regions?: { name: string; slug?: string };
  categories?: { name: string; icon: string; applicable_to?: string };
  place_media?: { url: string; media_type: string; caption?: string }[];
  place_highlights?: { id: string; title: string; description: string; icon: string }[];
  audio_stories?: { title: string; narrator: string; duration: string; url: string }[];
  products?: { id: string; name: string; price: number; description: string; image_url?: string }[];
  reviews?: {
    id: string;
    rating: number;
    text: string;
    is_tip: boolean;
    created_at: string;
    users?: { name: string; avatar_url?: string };
  }[];
}

export interface LeaderboardResponse {
  rank: number;
  id: string;
  name: string;
  avatar_url: string | null;
  region_id: string | null;
  total_xp: number;
  level: { id: string; number: number; name: string; xp_required: number } | null;
  reviews_count: number;
  approved_places_count: number;
}

export interface ProfileResponse {
  id: string;
  name: string;
  email: string;
  bio?: string | null;
  avatar_url: string | null;
  role: string;
  region_id: string | null;
  created_at: string;
  total_xp: number;
  level: { id: string; number: number; name: string; xp_required: number } | null;
  reviews_count: number;
  approved_places_count: number;
}

export interface CreateContributionPayload {
  name: string;
  description: string;
  lat: number;
  lng: number;
  regionId: string;
  categoryId: string;
  media?: string[];
  highlights?: { title: string; description: string; icon?: string }[];
}

export interface RegisterMerchantPayload {
  name: string;
  description?: string;
  lat: number;
  lng: number;
  regionId: string;
  categoryId: string;
  contactWhatsApp?: string;
  media?: string[];
  products?: { name: string; price: number; description?: string; imageUrl?: string }[];
  adPackageId?: string;
  adPaymentProofUrl?: string;
}

export interface MyMerchantResponse {
  id: string;
  type: string;
  name: string;
  slug: string;
  description: string;
  address?: string;
  lat?: number;
  lng?: number;
  rating: number;
  review_count: number;
  is_sponsored: boolean;
  status: string;
  contact_whatsapp?: string;
  contact_phone?: string;
  created_at: string;
  regions?: { name: string; slug?: string };
  categories?: { name: string; icon: string; applicable_to?: string };
  place_media?: { url: string; media_type?: string; caption?: string }[];
  products?: { id: string; name: string; price: number; description: string; image_url?: string }[];
}

export const exploreApi = {
  getFeed: () => api.get<ExploreFeedResponse[]>('/explore/feed'),
  getMap: (lat: number, lng: number, radius: number) =>
    api.get<ExploreMapResponse[]>(`/explore/map?lat=${lat}&lng=${lng}&radius=${radius}`),
};

export const placesApi = {
  getById: (id: string) => api.get<PlaceDetailResponse>(`/places/${id}`),
};

export const awardsApi = {
  getLeaderboard: (regionId?: string) =>
    api.get<LeaderboardResponse[]>(
      `/awards/leaderboard${regionId ? `?regionId=${regionId}` : ''}`
    ),
};

export interface RegionResponse {
  id: string;
  name: string;
  slug: string;
  parent_id?: string | null;
  parent?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  regencies?: RegionResponse[];
}

export const regionsApi = {
  getAll: (options?: { parentId?: string; type?: 'province' | 'regency'; grouped?: boolean }) => {
    const params = new URLSearchParams();
    if (options?.parentId) params.append('parentId', options.parentId);
    if (options?.type) params.append('type', options.type);
    if (options?.grouped) params.append('grouped', 'true');
    const queryString = params.toString();
    return api.get<RegionResponse[]>(`/regions${queryString ? `?${queryString}` : ''}`);
  },
  getGrouped: () => api.get<RegionResponse[]>('/regions?grouped=true'),
};

export const profileApi = {
  get: () => api.get<ProfileResponse>('/profile'),
  getById: (id: string) => api.get<ProfileResponse>(`/profile/${id}`),
  update: (data: { name?: string; bio?: string; avatar_url?: string }) =>
    api.put<ProfileResponse>('/profile', data),
};

export const contributionsApi = {
  create: (data: CreateContributionPayload) =>
    api.post<{ id: string }>('/contributions', data),
};

export const merchantApi = {
  register: (data: RegisterMerchantPayload) =>
    api.post<{ id: string }>('/merchant/register', data),
  getMyMerchants: () => api.get<MyMerchantResponse[]>('/merchant/my-merchants'),
};

export interface HeroSettings {
  hero_badge: string;
  hero_title: string;
  hero_subtitle: string;
  hero_image_url: string;
}

export const settingsApi = {
  getHero: () => api.get<HeroSettings>('/settings/hero'),
};

export interface AdminDashboardResponse {
  totalUsers: number;
  places: {
    pending: number;
    approved: number;
    rejected: number;
  };
  totalReviews: number;
  totalMerchants: number;
  pendingPayments: number;
  recentActivity: AdminAuditEntry[];
}

export interface AdminPlace {
  id: string;
  type: string;
  name: string;
  slug: string;
  description: string;
  status: string;
  is_sponsored: boolean;
  rating: number;
  review_count: number;
  created_at: string;
  category_id?: string;
  region_id?: string;
  lat?: number;
  lng?: number;
  regions?: { name: string; slug: string };
  categories?: { name: string; icon: string };
  place_media?: { url: string; media_type?: string; caption?: string }[];
  place_highlights?: { id: string; title: string; description: string; icon: string }[];
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  role: string;
  total_xp: number;
  banned_at: string | null;
  ban_reason: string | null;
  created_at: string;
  regions?: { name: string; slug: string } | null;
  levels?: { number: number; name: string } | null;
  approved_places_count?: number;
  reviews_count?: number;
}

export interface AdminMerchant extends AdminPlace {
  users?: { name: string; email: string };
}

export interface AdminContribution {
  id: string;
  rating: number;
  text: string;
  is_tip: boolean;
  created_at: string;
  places?: { name: string; slug: string };
  users?: { name: string; avatar_url: string | null };
}

export interface AdminAuditEntry {
  id: string;
  admin_id: string;
  action: string;
  target_type: string;
  target_id: string;
  details: Record<string, unknown> | null;
  created_at: string;
  users?: { name: string; avatar_url: string | null };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
}

async function requestPatch<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'PATCH', body: JSON.stringify(body) });
}

async function requestDelete<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'DELETE' });
}

export const adminApi = {
  getDashboard: () => api.get<AdminDashboardResponse>('/admin/dashboard'),

  getPlaces: (params?: { status?: string; search?: string; type?: string; page?: number }) => {
    const sp = new URLSearchParams();
    if (params?.status) sp.set('status', params.status);
    if (params?.search) sp.set('search', params.search);
    if (params?.type) sp.set('type', params.type);
    if (params?.page) sp.set('page', params.page.toString());
    const q = sp.toString();
    return api.get<PaginatedResponse<AdminPlace>>(`/admin/places${q ? `?${q}` : ''}`);
  },
  getPlaceById: (id: string) => api.get<AdminPlace>(`/admin/places/${id}`),
  updatePlaceStatus: (id: string, status: string) => requestPatch<AdminPlace>(`/admin/places/${id}/status`, { status }),
  updatePlace: (id: string, data: Record<string, unknown>) => api.put<AdminPlace>(`/admin/places/${id}`, data),
  deletePlace: (id: string) => requestDelete<{ message: string }>(`/admin/places/${id}`),

  getUsers: (params?: { role?: string; search?: string; page?: number }) => {
    const sp = new URLSearchParams();
    if (params?.role) sp.set('role', params.role);
    if (params?.search) sp.set('search', params.search);
    if (params?.page) sp.set('page', params.page.toString());
    const q = sp.toString();
    return api.get<PaginatedResponse<AdminUser>>(`/admin/users${q ? `?${q}` : ''}`);
  },
  getUserById: (id: string) => api.get<AdminUser>(`/admin/users/${id}`),
  updateUserRole: (id: string, role: string) => requestPatch<AdminUser>(`/admin/users/${id}/role`, { role }),
  banUser: (id: string, reason: string) => api.post<AdminUser>(`/admin/users/${id}/ban`, { reason }),
  unbanUser: (id: string) => api.post<AdminUser>(`/admin/users/${id}/unban`, {}),

  getMerchants: (params?: { status?: string; search?: string; page?: number }) => {
    const sp = new URLSearchParams();
    if (params?.status) sp.set('status', params.status);
    if (params?.search) sp.set('search', params.search);
    if (params?.page) sp.set('page', params.page.toString());
    const q = sp.toString();
    return api.get<PaginatedResponse<AdminMerchant>>(`/admin/merchants${q ? `?${q}` : ''}`);
  },
  approveMerchant: (id: string) => api.post<AdminPlace>(`/admin/merchants/${id}/approve`, {}),
  rejectMerchant: (id: string) => api.post<AdminPlace>(`/admin/merchants/${id}/reject`, {}),

  getContributions: (params?: { search?: string; page?: number }) => {
    const sp = new URLSearchParams();
    if (params?.search) sp.set('search', params.search);
    if (params?.page) sp.set('page', params.page.toString());
    const q = sp.toString();
    return api.get<PaginatedResponse<AdminContribution>>(`/admin/contributions${q ? `?${q}` : ''}`);
  },
  deleteContribution: (id: string) => requestDelete<{ message: string }>(`/admin/contributions/${id}`),

  getAuditLog: (params?: { page?: number }) => {
    const sp = new URLSearchParams();
    if (params?.page) sp.set('page', params.page.toString());
    const q = sp.toString();
    return api.get<PaginatedResponse<AdminAuditEntry>>(`/admin/audit-log${q ? `?${q}` : ''}`);
  },

  getHeroSettings: () => api.get<HeroSettings>('/admin/settings/hero'),
  updateHeroSettings: (data: Partial<HeroSettings>) =>
    api.put<HeroSettings>('/admin/settings/hero', data),
};
