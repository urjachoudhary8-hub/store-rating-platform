export type UserRole = 'admin' | 'user' | 'owner';

export interface User {
  id: string;
  name: string;
  email: string;
  address: string;
  role: UserRole;
  createdAt: string;
  ownerRating?: {
    averageRating: number;
    totalRatings: number;
    storesCount: number;
  } | null;
}

export interface Store {
  id: string;
  name: string;
  email: string;
  address: string;
  overallRating: number;
  totalRatings: number;
  userRating?: number | null;
  userRatingSubmittedAt?: string | null;
  owner?: {
    id: string;
    name: string;
    email: string;
  } | null;
  createdAt: string;
}

export interface Rating {
  id: string;
  storeId: string;
  userId: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminDashboardStats {
  totalUsers: number;
  totalStores: number;
  totalRatings: number;
  breakdown: {
    adminCount: number;
    normalUserCount: number;
    storeOwnerCount: number;
  };
}

export interface UserDetailData extends User {
  ownerStats?: {
    averageRating: number;
    totalRatings: number;
    stores: Array<{
      id: string;
      name: string;
      averageRating: number;
      totalRatings: number;
    }>;
  } | null;
}

export interface OwnerDashboardData {
  hasStore: boolean;
  message?: string;
  stores: Array<{
    store: {
      id: string;
      name: string;
      email: string;
      address: string;
    };
    averageRating: number;
    totalRatings: number;
    breakdown: Record<number, number>;
    raters: Array<{
      id: string;
      rating: number;
      createdAt: string;
      updatedAt: string;
      user: {
        id: string;
        name: string;
        email: string;
        address: string;
      };
    }>;
  }>;
  overallAverageRating: number;
  totalRatingsCount: number;
  ratingsBreakdown: Record<number, number>;
  raters: Array<{
    id: string;
    storeId: string;
    storeName: string;
    rating: number;
    createdAt: string;
    updatedAt: string;
    user: {
      id: string;
      name: string;
      email: string;
      address: string;
    };
  }>;
}
