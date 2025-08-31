export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateProjectRequest {
  title: string;
}

export interface UploadUrlRequest {
  filename: string;
  contentType: string;
}

export interface UploadUrlResponse {
  uploadUrl: string;
  assetId: string;
  expiresAt: string;
}

export interface AnalyzeRequest {
  assetId: string;
}

export interface GenerateRequest {
  type: 'intro' | 'outro';
  lengthBars: number;
  mood: 'calm' | 'energetic' | 'darker' | 'brighter';
}

export interface UserProfile {
  id: string;
  email: string;
  plan: UserPlan;
  credits: number;
  createdAt: string;
}

export type UserPlan = 'free' | 'pro' | 'enterprise';

export interface BillingInfo {
  plan: UserPlan;
  credits: number;
  nextBillingDate?: string;
  stripeCustomerId?: string;
}
