import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authMiddleware } from '../middleware/auth';
import { UploadService } from '../services/uploadService';

interface UploadUrlBody {
  filename: string;
  contentType: string;
}

interface ProjectParams {
  id: string;
}

export async function uploadRoutes(fastify: FastifyInstance) {
  const uploadService = new UploadService();

  // Get presigned upload URL
  fastify.post<{ Params: ProjectParams; Body: UploadUrlBody }>('/:id/upload-url', {
    preHandler: [authMiddleware],
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
      body: {
        type: 'object',
        required: ['filename', 'contentType'],
        properties: {
          filename: { type: 'string', minLength: 1, maxLength: 255 },
          contentType: { type: 'string', pattern: '^audio/' },
        },
      },
    },
    handler: async (request: FastifyRequest<{ Params: ProjectParams; Body: UploadUrlBody }>, reply: FastifyReply) => {
      try {
        const { id: projectId } = request.params;
        const { filename, contentType } = request.body;
        const userId = request.user!.id;

        // Validate file type
        if (!contentType.startsWith('audio/')) {
          return reply.status(400).send({
            success: false,
            error: 'Invalid file type',
            message: 'Only audio files are allowed',
          });
        }

        // Validate file extension
        const allowedExtensions = ['.mp3', '.wav', '.m4a', '.aac'];
        const fileExtension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
        if (!allowedExtensions.includes(fileExtension)) {
          return reply.status(400).send({
            success: false,
            error: 'Invalid file extension',
            message: 'Only MP3, WAV, M4A, and AAC files are supported',
          });
        }

        // Generate presigned upload URL
        const uploadData = await uploadService.generateUploadUrl({
          projectId,
          userId,
          filename,
          contentType,
        });

        return reply.send({
          success: true,
          data: {
            uploadUrl: uploadData.uploadUrl,
            assetId: uploadData.assetId,
            expiresAt: uploadData.expiresAt,
            fields: uploadData.fields, // For multipart uploads
          },
        });
      } catch (error) {
        request.log.error('Failed to generate upload URL:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to generate upload URL',
          message: error instanceof Error ? error.message : 'Internal server error',
        });
      }
    },
  });

  // Confirm upload completion
  fastify.post<{ Params: ProjectParams }>('/:id/upload-confirm', {
    preHandler: [authMiddleware],
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
      body: {
        type: 'object',
        required: ['assetId', 's3Key'],
        properties: {
          assetId: { type: 'string', format: 'uuid' },
          s3Key: { type: 'string' },
          fileSize: { type: 'number' },
          duration: { type: 'number' },
        },
      },
    },
    handler: async (request: FastifyRequest<{ Params: ProjectParams }>, reply: FastifyReply) => {
      try {
        const { id: projectId } = request.params;
        const { assetId, s3Key, fileSize, duration } = request.body as any;
        const userId = request.user!.id;

        // Confirm upload and create asset record
        const asset = await uploadService.confirmUpload({
          projectId,
          userId,
          assetId,
          s3Key,
          fileSize,
          duration,
        });

        return reply.send({
          success: true,
          data: asset,
          message: 'Upload confirmed successfully',
        });
      } catch (error) {
        request.log.error('Failed to confirm upload:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to confirm upload',
          message: error instanceof Error ? error.message : 'Internal server error',
        });
      }
    },
  });

  // Get project assets
  fastify.get<{ Params: ProjectParams }>('/:id/assets', {
    preHandler: [authMiddleware],
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
    },
    handler: async (request: FastifyRequest<{ Params: ProjectParams }>, reply: FastifyReply) => {
      try {
        const { id: projectId } = request.params;
        const userId = request.user!.id;

        const assets = await uploadService.getProjectAssets(projectId, userId);

        return reply.send({
          success: true,
          data: assets,
        });
      } catch (error) {
        request.log.error('Failed to get project assets:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to get project assets',
          message: error instanceof Error ? error.message : 'Internal server error',
        });
      }
    },
  });

  // Delete asset
  fastify.delete<{ Params: ProjectParams }>('/:id/assets/:assetId', {
    preHandler: [authMiddleware],
    schema: {
      params: {
        type: 'object',
        required: ['id', 'assetId'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          assetId: { type: 'string', format: 'uuid' },
        },
      },
    },
    handler: async (request: FastifyRequest<{ Params: ProjectParams & { assetId: string } }>, reply: FastifyReply) => {
      try {
        const { id: projectId, assetId } = request.params;
        const userId = request.user!.id;

        const deleted = await uploadService.deleteAsset(projectId, assetId, userId);

        if (!deleted) {
          return reply.status(404).send({
            success: false,
            error: 'Asset not found',
            message: 'The requested asset was not found or you do not have access to it',
          });
        }

        return reply.send({
          success: true,
          message: 'Asset deleted successfully',
        });
      } catch (error) {
        request.log.error('Failed to delete asset:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to delete asset',
          message: error instanceof Error ? error.message : 'Internal server error',
        });
      }
    },
  });
}
