import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authMiddleware } from '../middleware/auth';
import { JobService } from '../services/jobService';

interface JobParams {
  id: string;
}

export async function jobRoutes(fastify: FastifyInstance) {
  const jobService = new JobService();

  // Get job status
  fastify.get<{ Params: JobParams }>('/:id', {
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
    handler: async (request: FastifyRequest<{ Params: JobParams }>, reply: FastifyReply) => {
      try {
        const { id: jobId } = request.params;
        const userId = request.user!.id;

        const job = await jobService.getJob(jobId, userId);

        if (!job) {
          return reply.status(404).send({
            success: false,
            error: 'Job not found',
            message: 'The requested job was not found or you do not have access to it',
          });
        }

        return reply.send({
          success: true,
          data: job,
        });
      } catch (error) {
        request.log.error('Failed to get job:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to get job',
          message: error instanceof Error ? error.message : 'Internal server error',
        });
      }
    },
  });

  // Cancel job
  fastify.post<{ Params: JobParams }>('/:id/cancel', {
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
    handler: async (request: FastifyRequest<{ Params: JobParams }>, reply: FastifyReply) => {
      try {
        const { id: jobId } = request.params;
        const userId = request.user!.id;

        const cancelled = await jobService.cancelJob(jobId, userId);

        if (!cancelled) {
          return reply.status(404).send({
            success: false,
            error: 'Job not found',
            message: 'The requested job was not found or you do not have access to it',
          });
        }

        return reply.send({
          success: true,
          message: 'Job cancelled successfully',
        });
      } catch (error) {
        request.log.error('Failed to cancel job:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to cancel job',
          message: error instanceof Error ? error.message : 'Internal server error',
        });
      }
    },
  });
}
