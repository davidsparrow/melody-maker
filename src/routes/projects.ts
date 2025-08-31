import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authMiddleware } from '../middleware/auth';
import { ProjectService } from '../services/projectService';
import type { CreateProjectRequest, UpdateProjectRequest } from '../types/project';

// Extend FastifyRequest to include user
declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string;
      email: string;
      plan: string;
    };
  }
}

interface CreateProjectBody extends CreateProjectRequest {}
interface UpdateProjectBody extends UpdateProjectRequest {}
interface ProjectParams {
  id: string;
}

export async function projectRoutes(fastify: FastifyInstance) {
  const projectService = new ProjectService();

  // Create new project
  fastify.post<{ Body: CreateProjectBody }>('/', {
    preHandler: [authMiddleware],
    schema: {
      body: {
        type: 'object',
        required: ['title'],
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 100 },
          description: { type: 'string', maxLength: 500 },
        },
      },
    },
    handler: async (request: FastifyRequest<{ Body: CreateProjectBody }>, reply: FastifyReply) => {
      try {
        const { title, description } = request.body;
        const userId = request.user!.id;

        const project = await projectService.createProject({
          title,
          description,
          userId,
        });

        return reply.status(201).send({
          success: true,
          data: project,
          message: 'Project created successfully',
        });
      } catch (error) {
        request.log.error('Failed to create project:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to create project',
          message: error instanceof Error ? error.message : 'Internal server error',
        });
      }
    },
  });

  // Get all projects for user
  fastify.get('/', {
    preHandler: [authMiddleware],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', minimum: 1, default: 1 },
          limit: { type: 'number', minimum: 1, maximum: 100, default: 20 },
          status: { type: 'string', enum: ['draft', 'analyzing', 'ready', 'generating', 'completed', 'error'] },
        },
      },
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = request.user!.id;
        const { page = 1, limit = 20, status } = request.query as any;

        const projects = await projectService.getUserProjects(userId, {
          page,
          limit,
          status,
        });

        return reply.send({
          success: true,
          data: projects.data,
          pagination: projects.pagination,
        });
      } catch (error) {
        request.log.error('Failed to get projects:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to get projects',
          message: error instanceof Error ? error.message : 'Internal server error',
        });
      }
    },
  });

  // Get specific project
  fastify.get<{ Params: ProjectParams }>('/:id', {
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
        const { id } = request.params;
        const userId = request.user!.id;

        const project = await projectService.getProject(id, userId);

        if (!project) {
          return reply.status(404).send({
            success: false,
            error: 'Project not found',
            message: 'The requested project was not found or you do not have access to it',
          });
        }

        return reply.send({
          success: true,
          data: project,
        });
      } catch (error) {
        request.log.error('Failed to get project:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to get project',
          message: error instanceof Error ? error.message : 'Internal server error',
        });
      }
    },
  });

  // Update project
  fastify.put<{ Params: ProjectParams; Body: UpdateProjectBody }>('/:id', {
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
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 100 },
          description: { type: 'string', maxLength: 500 },
          status: { type: 'string', enum: ['draft', 'analyzing', 'ready', 'generating', 'completed', 'error'] },
        },
      },
    },
    handler: async (request: FastifyRequest<{ Params: ProjectParams; Body: UpdateProjectBody }>, reply: FastifyReply) => {
      try {
        const { id } = request.params;
        const updates = request.body;
        const userId = request.user!.id;

        const project = await projectService.updateProject(id, userId, updates);

        if (!project) {
          return reply.status(404).send({
            success: false,
            error: 'Project not found',
            message: 'The requested project was not found or you do not have access to it',
          });
        }

        return reply.send({
          success: true,
          data: project,
          message: 'Project updated successfully',
        });
      } catch (error) {
        request.log.error('Failed to update project:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to update project',
          message: error instanceof Error ? error.message : 'Internal server error',
        });
      }
    },
  });

  // Delete project
  fastify.delete<{ Params: ProjectParams }>('/:id', {
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
        const { id } = request.params;
        const userId = request.user!.id;

        const deleted = await projectService.deleteProject(id, userId);

        if (!deleted) {
          return reply.status(404).send({
            success: false,
            error: 'Project not found',
            message: 'The requested project was not found or you do not have access to it',
          });
        }

        return reply.send({
          success: true,
          message: 'Project deleted successfully',
        });
      } catch (error) {
        request.log.error('Failed to delete project:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to delete project',
          message: error instanceof Error ? error.message : 'Internal server error',
        });
      }
    },
  });
}
