export interface UserProfile {
  id: string;
  email: string;
  plan: 'free' | 'pro' | 'enterprise';
  credits: number;
  createdAt: string;
}

export interface CreateProjectRequest {
  title: string;
  description?: string;
}

export interface GenerateRequest {
  projectId: string;
  type: 'intro' | 'outro';
  lengthBars: number;
  mood: 'calm' | 'energetic' | 'darker' | 'brighter';
  style?: string;
  instrumentation?: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
  message?: string;
}

export interface UploadUrlRequest {
  filename: string;
  contentType: string;
}

export interface UploadUrlResponse {
  uploadUrl: string;
  assetId: string;
}

export interface AnalyzeRequest {
  assetId: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: UserProfile;
    token: string;
  };
  error?: string;
  message?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

// Re-export types from project.d.ts to avoid circular dependencies
export type { Project, AudioAsset, GenerationJob } from './project';
