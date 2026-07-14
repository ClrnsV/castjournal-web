export interface CatchMedia {
  id: string;
  mediaUrl: string;
  fileName: string | null;
  mediaType: string;
  orderIndex: number;
}

export interface Catch {
  id: string;
  userId: string;
  userFullName: string | null;
  userAvatarUrl: string | null;
  speciesId: string;
  speciesName: string | null;
  locationId: string | null;
  locationName: string | null;
  catchDate: string;
  weight: number | null;
  length: number | null;
  gearUsed: string | null;
  baitUsed: string | null;
  fishingMethod: string | null;
  notes: string | null;
  weatherConditions: string | null;
  isPublic: boolean;
  createdAt: string;
  likeCount: number;
  isLikedByCurrentUser: boolean;
  media: CatchMedia[];
}

export interface CreateCatchPayload {
  speciesId: string;
  locationId: string | null;
  catchDate: string;
  weight: number | null;
  length: number | null;
  gearUsed: string | null;
  baitUsed: string | null;
  fishingMethod: string | null;
  notes: string | null;
  weatherConditions: string | null;
  isPublic: boolean;
}

export interface CatchFilter {
  speciesId?: string;
  locationId?: string;
  startDate?: string;
  endDate?: string;
  minWeight?: number;
  maxWeight?: number;
  searchTerm?: string;
  sortBy?: 'catchdate' | 'weight' | 'length';
  sortDescending?: boolean;
  page?: number;
  pageSize?: number;
}

export interface FeedFilter {
  userId?: string;
  followingOnly?: boolean;
  page?: number;
  pageSize?: number;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

