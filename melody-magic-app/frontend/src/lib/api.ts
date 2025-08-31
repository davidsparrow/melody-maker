import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { API_CONFIG } from './config';
import type { 
  ApiResponse, 
  PaginatedResponse, 
  CreateProjectRequest, 
  UploadUrlRequest,
  UploadUrlResponse,
  AnalyzeRequest,
  GenerateRequest,
  Project,
  AudioAsset,
  GenerationJob
} from '@/types/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.baseUrl,
      timeout: API_CONFIG.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for auth
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => this.handleApiError(error)
    );
  }

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('melody_magic_auth_token');
    }
    return null;
  }

  private handleApiError(error: AxiosError): never {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      const message = (data as any)?.message || `HTTP ${status} error`;
      throw new Error(message);
    } else if (error.request) {
      // Request made but no response
      throw new Error('Network error - no response received');
    } else {
      // Something else happened
      throw new Error(error.message || 'Unknown error occurred');
    }
  }

  // Project endpoints
  async createProject(data: CreateProjectRequest): Promise<ApiResponse<Project>> {
    const response = await this.client.post<ApiResponse<Project>>('/v1/projects', data);
    return response.data;
  }

  async getProjects(): Promise<PaginatedResponse<Project>> {
    const response = await this.client.get<PaginatedResponse<Project>>('/v1/projects');
    return response.data;
  }

  async getProject(id: string): Promise<ApiResponse<Project>> {
    const response = await this.client.get<ApiResponse<Project>>(`/v1/projects/${id}`);
    return response.data;
  }

  // Upload endpoints
  async getUploadUrl(projectId: string, data: UploadUrlRequest): Promise<ApiResponse<UploadUrlResponse>> {
    const response = await this.client.post<ApiResponse<UploadUrlResponse>>(
      `/v1/projects/${projectId}/upload-url`,
      data
    );
    return response.data;
  }

  // Analysis endpoints
  async analyzeAudio(projectId: string, data: AnalyzeRequest): Promise<ApiResponse<GenerationJob>> {
    const response = await this.client.post<ApiResponse<GenerationJob>>(
      `/v1/projects/${projectId}/analyze`,
      data
    );
    return response.data;
  }

  // Generation endpoints
  async generateSection(projectId: string, data: GenerateRequest): Promise<ApiResponse<GenerationJob>> {
    const response = await this.client.post<ApiResponse<GenerationJob>>(
      `/v1/projects/${projectId}/generate`,
      data
    );
    return response.data;
  }

  // Job status endpoints
  async getJobStatus(jobId: string): Promise<ApiResponse<GenerationJob>> {
    const response = await this.client.get<ApiResponse<GenerationJob>>(`/v1/jobs/${jobId}`);
    return response.data;
  }

  // Assets endpoints
  async getProjectAssets(projectId: string): Promise<ApiResponse<AudioAsset[]>> {
    const response = await this.client.get<ApiResponse<AudioAsset[]>>(
      `/v1/projects/${projectId}/artifacts`
    );
    return response.data;
  }

  // Utility method for direct file upload to S3
  async uploadToS3(uploadUrl: string, file: File, onProgress?: (progress: number) => void): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);

    await axios.put(uploadUrl, file, {
      headers: {
        'Content-Type': file.type,
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
