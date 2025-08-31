import { v4 as uuidv4 } from 'uuid';
import type { AudioAsset } from '../types/project';

interface UploadUrlData {
  projectId: string;
  userId: string;
  filename: string;
  contentType: string;
}

interface ConfirmUploadData {
  projectId: string;
  userId: string;
  assetId: string;
  s3Key: string;
  fileSize: number;
  duration: number;
}

export class UploadService {
  // TODO: Replace with actual S3 integration
  private assets: Map<string, AudioAsset> = new Map();

  async generateUploadUrl(data: UploadUrlData): Promise<{
    uploadUrl: string;
    assetId: string;
    expiresAt: string;
    fields: Record<string, string>;
  }> {
    const assetId = uuidv4();
    const s3Key = `uploads/${data.projectId}/${assetId}/${data.filename}`;
    
    // TODO: Generate actual presigned URL from AWS S3
    const uploadUrl = `https://s3.amazonaws.com/mock-bucket/${s3Key}`;
    const expiresAt = new Date(Date.now() + 3600000).toISOString(); // 1 hour

    return {
      uploadUrl,
      assetId,
      expiresAt,
      fields: {
        key: s3Key,
        'Content-Type': data.contentType,
      },
    };
  }

  async confirmUpload(data: ConfirmUploadData): Promise<AudioAsset> {
    const asset: AudioAsset = {
      id: data.assetId,
      projectId: data.projectId,
      type: 'original',
      s3Key: data.s3Key,
      s3Url: `https://s3.amazonaws.com/mock-bucket/${data.s3Key}`,
      durationSec: data.duration,
      format: 'audio/mpeg', // TODO: Detect from file
      fileSize: data.fileSize,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.assets.set(asset.id, asset);
    return asset;
  }

  async getProjectAssets(projectId: string, userId: string): Promise<AudioAsset[]> {
    // TODO: Verify user has access to project
    return Array.from(this.assets.values())
      .filter(asset => asset.projectId === projectId);
  }

  async deleteAsset(projectId: string, assetId: string, userId: string): Promise<boolean> {
    const asset = this.assets.get(assetId);
    
    if (!asset || asset.projectId !== projectId) {
      return false;
    }

    // TODO: Delete from S3
    this.assets.delete(assetId);
    return true;
  }

  async getAsset(assetId: string): Promise<AudioAsset | null> {
    return this.assets.get(assetId) || null;
  }
}
