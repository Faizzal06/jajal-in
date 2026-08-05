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
  rating: number;
  review_count: number;
  is_sponsored: boolean;
  status: string;
  contact_whatsapp?: string;
  contact_phone?: string;
  created_at: string;
  regions?: { name: string; slug?: string };
  categories?: { name: string; icon: string; applicable_to?: string };
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
}

export interface PlaceDetailResponse {
  id: string;
  type: string;
  name: string;
  slug: string;
  description: string;
  location: string;
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
}

export interface RegisterMerchantPayload {
  name: string;
  description: string;
  lat: number;
  lng: number;
  regionId: string;
  categoryId: string;
  contactWhatsApp: string;
  products?: { name: string; price: number; description: string; imageUrl?: string }[];
  adPackageId?: string;
  adPaymentProofUrl?: string;
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

export const profileApi = {
  get: () => api.get<ProfileResponse>('/profile'),
  update: (data: { display_name?: string; bio?: string; avatar_url?: string }) =>
    api.put<ProfileResponse>('/profile', data),
};

export const contributionsApi = {
  create: (data: CreateContributionPayload) =>
    api.post<{ id: string }>('/contributions', data),
};

export const merchantApi = {
  register: (data: RegisterMerchantPayload) =>
    api.post<{ id: string }>('/merchant/register', data),
};
