export interface Project {
  id: string;
  userId: string;
  title: string;
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type ProjectStatus = 'draft' | 'analyzing' | 'ready' | 'generating' | 'completed' | 'error';

export interface AudioAsset {
  id: string;
  projectId: string;
  type: AssetType;
  s3Key: string;
  s3Url: string;
  durationSec: number;
  format: string;
  fileSize: number;
  createdAt: Date;
  updatedAt: Date;
}

export type AssetType = 'original' | 'analysis_json' | 'gen_intro' | 'gen_outro' | 'preview_mix';

export interface AudioAnalysis {
  id: string;
  assetId: string;
  projectId: string;
  bpm: number;
  key: string;
  mode: string;
  energy: number;
  sections: AudioSection[];
  durationSec: number;
  features: AudioFeatures;
  createdAt: Date;
}

export interface AudioSection {
  label: string;
  startSec: number;
  endSec: number;
  confidence: number;
}

export interface AudioFeatures {
  mfcc: number[][];
  chroma: number[][];
  spectral: {
    centroid: number[];
    rolloff: number[];
    bandwidth: number[];
  };
  rhythm: {
    tempo: number;
    beatTimes: number[];
    onsetStrength: number[];
  };
}

export interface GenerationJob {
  id: string;
  projectId: string;
  kind: JobKind;
  status: JobStatus;
  payload: GenerationPayload;
  result?: GenerationResult;
  error?: string;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export type JobKind = 'analysis' | 'generate_intro' | 'generate_outro';

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface GenerationPayload {
  type: 'intro' | 'outro';
  lengthBars: number;
  mood: 'calm' | 'energetic' | 'darker' | 'brighter';
  style?: string;
  instrumentation?: string[];
}

export interface GenerationResult {
  audioUrl: string;
  s3Key: string;
  durationSec: number;
  metadata: {
    key: string;
    bpm: number;
    mood: string;
    provider: string;
    model: string;
    generationTime: number;
  };
  quality: {
    score: number;
    issues: string[];
  };
}

export interface CreateProjectRequest {
  title: string;
  description?: string;
}

export interface UpdateProjectRequest {
  title?: string;
  description?: string;
  status?: ProjectStatus;
}

export interface ProjectResponse {
  success: boolean;
  data?: Project;
  error?: string;
  message?: string;
}

export interface ProjectsResponse {
  success: boolean;
  data?: Project[];
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
