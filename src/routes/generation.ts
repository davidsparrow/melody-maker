import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authMiddleware } from '../middleware/auth';
import { GenerationService } from '../services/generationService';
import type { GenerationPayload } from '../types/project';

interface GenerationBody extends GenerationPayload {}

interface ProjectParams {
  id: string;
}

export async function generationRoutes(fastify: FastifyInstance) {
  const generationService = new GenerationService();

  // Generate song section
  fastify.post<{ Params: ProjectParams; Body: GenerationBody }>('/:id/generate', {
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
        required: ['type', 'lengthBars', 'mood'],
        properties: {
          type: { type: 'string', enum: ['intro', 'outro'] },
          lengthBars: { type: 'number', minimum: 4, maximum: 16 },
          mood: { type: 'string', enum: ['calm', 'energetic', 'darker', 'brighter'] },
          style: { type: 'string', maxLength: 100 },
          instrumentation: { 
            type: 'array', 
            items: { type: 'string' },
            maxItems: 10
          },
        },
      },
    },
    handler: async (request: FastifyRequest<{ Params: ProjectParams; Body: GenerationBody }>, reply: FastifyReply) => {
      try {
        const { id: projectId } = request.params;
        const generationData = request.body;
        const userId = request.user!.id;

        // Check if user has credits for generation
        const hasCredits = await generationService.checkUserCredits(userId, 'generation');
        if (!hasCredits) {
          return reply.status(402).send({
            success: false,
            error: 'Insufficient credits',
            message: 'You need credits to generate song sections. Please upgrade your plan.',
          });
        }

        // Check if project has analysis results
        const hasAnalysis = await generationService.checkProjectAnalysis(projectId, userId);
        if (!hasAnalysis) {
          return reply.status(400).send({
            success: false,
            error: 'Analysis required',
            message: 'Audio analysis must be completed before generating sections.',
          });
        }

        // Start generation job
        const job = await generationService.startGeneration({
          projectId,
          userId,
          payload: generationData,
        });

        return reply.status(202).send({
          success: true,
          data: {
            jobId: job.id,
            status: job.status,
            message: `AI generation of ${generationData.type} started successfully`,
          },
        });
      } catch (error) {
        request.log.error('Failed to start generation:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to start generation',
          message: error instanceof Error ? error.message : 'Internal server error',
        });
      }
    },
  });

  // Get generation results
  fastify.get<{ Params: ProjectParams }>('/:id/generations', {
    preHandler: [authMiddleware],
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
      querystring: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['intro', 'outro'] },
          status: { type: 'string', enum: ['pending', 'processing', 'completed', 'failed'] },
        },
      },
    },
    handler: async (request: FastifyRequest<{ Params: ProjectParams }>, reply: FastifyReply) => {
      try {
        const { id: projectId } = request.params;
        const { type, status } = request.query as any;
        const userId = request.user!.id;

        const generations = await generationService.getGenerations(projectId, userId, {
          type,
          status,
        });

        return reply.send({
          success: true,
          data: generations,
        });
      } catch (error) {
        request.log.error('Failed to get generations:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to get generations',
          message: error instanceof Error ? error.message : 'Internal server error',
        });
      }
    },
  });

  // Get specific generation
  fastify.get<{ Params: ProjectParams }>('/:id/generations/:generationId', {
    preHandler: [authMiddleware],
    schema: {
      params: {
        type: 'object',
        required: ['id', 'generationId'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          generationId: { type: 'string', format: 'uuid' },
        },
      },
    },
    handler: async (request: FastifyRequest<{ Params: ProjectParams & { generationId: string } }>, reply: FastifyReply) => {
      try {
        const { id: projectId, generationId } = request.params;
        const userId = request.user!.id;

        const generation = await generationService.getGeneration(projectId, generationId, userId);

        if (!generation) {
          return reply.status(404).send({
            success: false,
            error: 'Generation not found',
            message: 'The requested generation was not found or you do not have access to it',
          });
        }

        return reply.send({
          success: true,
          data: generation,
        });
      } catch (error) {
        request.log.error('Failed to get generation:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to get generation',
          message: error instanceof Error ? error.message : 'Internal server error',
        });
      }
    },
  });

  // Regenerate section with variations
  fastify.post<{ Params: ProjectParams; Body: GenerationBody }>('/:id/regenerate', {
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
        required: ['type', 'lengthBars', 'mood'],
        properties: {
          type: { type: 'string', enum: ['intro', 'outro'] },
          lengthBars: { type: 'number', minimum: 4, maximum: 16 },
          mood: { type: 'string', enum: ['calm', 'energetic', 'darker', 'brighter'] },
          style: { type: 'string', maxLength: 100 },
          instrumentation: { 
            type: 'array', 
            items: { type: 'string' },
            maxItems: 10
          },
          variations: { type: 'number', minimum: 1, maximum: 3, default: 1 },
        },
      },
    },
    handler: async (request: FastifyRequest<{ Params: ProjectParams; Body: GenerationBody & { variations?: number } }>, reply: FastifyReply) => {
      try {
        const { id: projectId } = request.params;
        const { variations = 1, ...generationData } = request.body;
        const userId = request.user!.id;

        // Check if user has credits for regeneration
        const hasCredits = await generationService.checkUserCredits(userId, 'generation', variations);
        if (!hasCredits) {
          return reply.status(402).send({
            success: false,
            error: 'Insufficient credits',
            message: `You need ${variations} credits to generate ${variations} variation(s). Please upgrade your plan.`,
          });
        }

        // Start regeneration jobs
        const jobs = await generationService.startRegeneration({
          projectId,
          userId,
          payload: generationData,
          variations,
        });

        return reply.status(202).send({
          success: true,
          data: {
            jobIds: jobs.map(job => job.id),
            status: 'processing',
            message: `Started generation of ${variations} variation(s)`,
          },
        });
      } catch (error) {
        request.log.error('Failed to start regeneration:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to start regeneration',
          message: error instanceof Error ? error.message : 'Internal server error',
        });
      }
    },
  });
}
