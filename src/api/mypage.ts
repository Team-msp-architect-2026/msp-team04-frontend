import apiClient from './client';

export type ApplicationStatus =
  | 'PENDING'
  | 'PAYMENT_READY'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'FAILED';

export type PaymentStatus =
  | 'READY'
  | 'APPROVED'
  | 'FAILED'
  | 'CANCELLED'
  | 'EXPIRED';

export type PaymentMethod = 'TOSS_PAYMENTS' | 'FREE';

export interface ApplicationListItem {
  applicationId: number;
  programTitle: string;
  institutionName: string | null;
  region: string | null;
  imageUrl: string | null;
  appliedAt: string;
  applicationStatus: ApplicationStatus;
  paymentStatus: PaymentStatus | null;
}

export interface ApplicationDetail {
  applicationId: number;
  programTitle: string;
  institutionName: string | null;
  region: string | null;
  imageUrl: string | null;
  applicantName: string;
  parentName: string;
  phone: string;
  appliedAt: string;
  applicationStatus: ApplicationStatus;
  paymentStatus: PaymentStatus | null;
  paymentMethod: PaymentMethod | null;
  paymentAmount: number | null;
  orderId: string | null;
  paymentKey: string | null;
  approvedAt: string | null;
}


export interface BookmarkItem {
  programId: number;
  title: string;
  category: string | null;
  region: string | null;
  imageUrl: string | null;
  price: number;
  isFree: boolean;
  ratingAvg: number;
  reviewCount: number;
  isRecruiting: boolean;
}

export interface BookmarkToggleResult {
  programId: number;
  bookmarked: boolean;
}
export const mypageApi = {
  getApplicationList: async (status?: ApplicationStatus): Promise<ApplicationListItem[]> => {
    const params = status ? { status } : {};
    const res = await apiClient.get('/api/mypage/applications', { params });
    return res.data.data;
  },

  getApplicationDetail: async (applicationId: number): Promise<ApplicationDetail> => {
    const res = await apiClient.get(`/api/mypage/applications/${applicationId}`);
    return res.data.data;
  },

  getBookmarkList: async (): Promise<BookmarkItem[]> => {
    const res = await apiClient.get('/api/mypage/bookmarks');
    return res.data.data;
  },

  toggleBookmark: async (programId: number): Promise<BookmarkToggleResult> => {
    const res = await apiClient.post(`/api/mypage/bookmarks/${programId}`);
    return res.data.data;
  },
};