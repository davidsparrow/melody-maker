import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authMiddleware } from '../middleware/auth';
import { AnalysisService } from '../services/analysisService';

interface AnalysisBody {
  assetId: string;
}

interface ProjectParams {
  id: string;
}

export async function analysisRoutes(fastify: FastifyInstance) {
  const analysisService = new AnalysisService();

  // Start audio analysis
  fastify.post<{ Params: ProjectParams; Body: AnalysisBody }>('/:id/analyze', {
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
        required: ['assetId'],
        properties: {
          assetId: { type: 'string', format: 'uuid' },
        },
      },
    },
    handler: async (request: FastifyRequest<{ Params: ProjectParams; Body: AnalysisBody }>, reply: FastifyReply) => {
      try {
        const { id: projectId } = request.params;
        const { assetId } = request.body;
        const userId = request.user!.id;

        // Check if user has credits for analysis
        const hasCredits = await analysisService.checkUserCredits(userId, 'analysis');
        if (!hasCredits) {
          return reply.status(402).send({
            success: false,
            error: 'Insufficient credits',
            message: 'You need credits to analyze audio files. Please upgrade your plan.',
          });
        }

        // Start analysis job
        const job = await analysisService.startAnalysis({
          projectId,
          userId,
          assetId,
        });

        return reply.status(202).send({
          success: true,
          data: {
            jobId: job.id,
            status: job.status,
            message: 'Audio analysis started successfully',
          },
        });
      } catch (error) {
        request.log.error('Failed to start analysis:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to start analysis',
          message: error instanceof Error ? error.message : 'Internal server error',
        });
      }
    },
  });

  // Get analysis results
  fastify.get<{ Params: ProjectParams }>('/:id/analysis', {
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

        const analysis = await analysisService.getAnalysis(projectId, userId);

        if (!analysis) {
          return reply.status(404).send({
            success: false,
            error: 'Analysis not found',
            message: 'No analysis results found for this project',
          });
        }

        return reply.send({
          success: true,
          data: analysis,
        });
      } catch (error) {
        request.log.error('Failed to get analysis:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to get analysis',
          message: error instanceof Error ? error.message : 'Internal server error',
        });
      }
    },
  });

  // Get analysis job status
  fastify.get<{ Params: ProjectParams }>('/:id/analysis/status', {
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

        const status = await analysisService.getAnalysisStatus(projectId, userId);

        return reply.send({
          success: true,
          data: status,
        });
      } catch (error) {
        request.log.error('Failed to get analysis status:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to get analysis status',
          message: error instanceof Error ? error.message : 'Internal server error',
        });
      }
    },
  });

  // Retry failed analysis
  fastify.post<{ Params: ProjectParams }>('/:id/analysis/retry', {
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

        // Check if user has credits for retry
        const hasCredits = await analysisService.checkUserCredits(userId, 'analysis');
        if (!hasCredits) {
          return reply.status(402).send({
            success: false,
            error: 'Insufficient credits',
            message: 'You need credits to retry analysis. Please upgrade your plan.',
          });
        }

        // Retry analysis
        const job = await analysisService.retryAnalysis(projectId, userId);

        return reply.status(202).send({
          success: true,
          data: {
            jobId: job.id,
            status: job.status,
            message: 'Analysis retry started successfully',
          },
        });
      } catch (error) {
        request.log.error('Failed to retry analysis:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to retry analysis',
          message: error instanceof Error ? error.message : 'Internal server error',
        });
      }
    },
  });
}
