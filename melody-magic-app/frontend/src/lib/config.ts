export const APP_CONFIG = {
  name: 'Melody Magic',
  version: '1.0.0',
  description: 'AI-Assisted Song Section Generator',
} as const;

export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  timeout: 30000, // 30 seconds for large audio files
} as const;

export const AUDIO_CONFIG = {
  maxFileSize: 50 * 1024 * 1024, // 50 MB
  maxDuration: 10 * 60, // 10 minutes
  supportedFormats: ['audio/mpeg', 'audio/wav', 'audio/mp3'],
  chunkSize: 1024 * 1024, // 1MB chunks for large file uploads
} as const;

export const UPLOAD_CONFIG = {
  maxConcurrent: 3,
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
} as const;

export const GENERATION_CONFIG = {
  maxLengthBars: 16,
  minLengthBars: 4,
  defaultLengthBars: 8,
  supportedMoods: ['calm', 'energetic', 'darker', 'brighter'] as const,
} as const;

export const STORAGE_KEYS = {
  authToken: 'melody_magic_auth_token',
  userProfile: 'melody_magic_user_profile',
  projectDraft: 'melody_magic_project_draft',
} as const;
