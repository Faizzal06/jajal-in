export interface Region {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  parent_id?: string | null;
  parent?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  regencies?: Region[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  applicableTo: 'gem' | 'merchant' | 'both';
  icon: string;
}

export interface GemMedia {
  id: string;
  url: string;
  mediaType: 'image' | 'video';
  caption?: string;
}

export interface AudioStory {
  id: string;
  title: string;
  narrator: string;
  duration: string;
  url?: string;
}

export interface ExperienceHighlight {
  id?: string;
  title: string;
  description: string;
  icon?: string;
}

export interface Gem {
  id: string;
  slug: string;
  name: string;
  region: Region;
  category: Category;
  description: string;
  address?: string;
  lat: number;
  lng: number;
  rating: number;
  reviewCount: number;
  status: 'approved' | 'pending' | 'rejected';
  isSponsored: boolean;
  media: GemMedia[];
  audioStory?: AudioStory;
  highlights?: ExperienceHighlight[];
  tags: string[];
  distance?: number;
}

export interface Review {
  id: string;
  user: User;
  gemId: string;
  rating: number;
  text: string;
  date: string;
  isTip: boolean;
}

export interface MerchantProduct {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
}

export interface Merchant {
  id: string;
  slug: string;
  name: string;
  ownerId: string;
  region: Region;
  category: Category;
  description: string;
  address?: string;
  lat: number;
  lng: number;
  rating: number;
  reviewCount: number;
  contactWhatsApp?: string;
  contactPhone?: string;
  status: 'pending_payment' | 'pending_approval' | 'active' | 'suspended';
  isSponsored: boolean;
  media: string[];
  products: MerchantProduct[];
  distance?: number;
}

export interface Level {
  id: string;
  number: number;
  name: string;
  xpRequired: number;
}

export interface Badge {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  criterionType: 'cities_visited' | 'photos_uploaded' | 'reviews_count' | 'gems_submitted';
  criterionValue: number;
  unlocked?: boolean;
  progress?: number;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  targetCount: number;
  progressCount: number;
  xpReward: number;
}

export interface LeaderboardEntry {
  id: string;
  user: User;
  totalXp: number;
  rank: number;
  region: Region;
  period: 'weekly' | 'monthly' | 'all_time';
  isCurrentUser?: boolean;
}

export interface User {
  id: string;
  googleId?: string;
  email: string;
  name: string;
  avatarUrl: string;
  role: 'user' | 'admin' | 'merchant';
  region: Region;
  level: Level;
  totalXp: number;
  totalContributions: number;
  totalTrips?: number;
  totalPhotos: number;
  rating: number;
  isMerchant?: boolean;
  title?: string;
}

export interface AdPackage {
  id: string;
  name: string;
  durationDays: number;
  priceIdr: number;
  description: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

export interface AdPayment {
  id: string;
  listingId: string;
  bankAccountId: string;
  amount: number;
  proofUrl?: string;
  status: 'pending' | 'verified' | 'rejected';
  verifiedById?: string;
}

export interface ContributionSubmission {
  id: string;
  userId: string;
  regionId: string;
  categoryId: string;
  name: string;
  description: string;
  lat: number;
  lng: number;
  media: string[];
  status: 'draft' | 'pending' | 'approved' | 'rejected';
}
