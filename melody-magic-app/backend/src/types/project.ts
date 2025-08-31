export interface Project {
  id: string;
  title: string;
  description: string;
  userId: string;
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
  assets: AudioAsset[];
  analysis: AudioAnalysis | null;
  generations: GenerationJob[];
}

export type ProjectStatus = 'draft' | 'analyzing' | 'analyzed' | 'generating' | 'completed' | 'archived';

export interface AudioAsset {
  id: string;
  projectId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  s3Key: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AudioAnalysis {
  id: string;
  projectId: string;
  assetId: string;
  createdAt: Date;
  updatedAt: Date;
  features: AudioFeatures;
  sections: AudioSection[];
}

export interface AudioFeatures {
  bpm: number;
  key: string;
  mode: 'major' | 'minor';
  duration: number;
  energy: number;
  valence: number;
  danceability: number;
}

export interface AudioSection {
  start: number;
  end: number;
  type: string;
  confidence: number;
}

export interface GenerationJob {
  id: string;
  projectId: string;
  userId: string;
  kind: 'analysis' | 'generation';
  status: JobStatus;
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  payload?: GenerationPayload;
  result?: any;
  error?: string;
  attempts: number;
  maxAttempts: number;
}

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface GenerationPayload {
  sectionType: string;
  style?: string;
  instrumentation?: string;
  duration?: number;
  userId: string;
  count?: number;
}

export interface CreateProjectRequest {
  title: string;
  description?: string;
  userId: string;
}

export interface UpdateProjectRequest {
  title?: string;
  description?: string;
  userId: string;
}

export interface UploadUrlResponse {
  uploadUrl: string;
  s3Key: string;
  fields: Record<string, string>;
}
