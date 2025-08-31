import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import jwt from '@fastify/jwt';
import websocket from '@fastify/websocket';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import { projectRoutes } from './routes/projects';
import { uploadRoutes } from './routes/uploads';
import { analysisRoutes } from './routes/analysis';
import { generationRoutes } from './routes/generation';
import { jobRoutes } from './routes/jobs';
import { billingRoutes } from './routes/billing';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';

// Create Fastify instance
const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
  trustProxy: true,
});

// Register plugins
async function registerPlugins() {
  try {
    // CORS
    await fastify.register(cors, {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    });

    // Multipart for file uploads
    await fastify.register(multipart, {
      limits: {
        fileSize: 50 * 1024 * 1024, // 50 MB
        files: 1,
      },
    });

    // JWT for authentication
    await fastify.register(jwt, {
      secret: process.env.JWT_SECRET || 'your-secret-key',
      sign: {
        expiresIn: '1h',
      },
    });

    // WebSocket for real-time updates
    await fastify.register(websocket);

    // Global error handler
    fastify.setErrorHandler(errorHandler);

    fastify.log.info('Plugins registered successfully');
  } catch (error) {
    fastify.log.error('Failed to register plugins:', error);
    process.exit(1);
  }
}

// Register routes
async function registerRoutes() {
  try {
    // Health check
    fastify.get('/health', async () => {
      return { status: 'ok', timestamp: new Date().toISOString() };
    });

    // API routes
    await fastify.register(projectRoutes, { prefix: '/v1/projects' });
    await fastify.register(uploadRoutes, { prefix: '/v1/projects' });
    await fastify.register(analysisRoutes, { prefix: '/v1/projects' });
    await fastify.register(generationRoutes, { prefix: '/v1/projects' });
    await fastify.register(jobRoutes, { prefix: '/v1/jobs' });
    await fastify.register(billingRoutes, { prefix: '/v1/billing' });

    fastify.log.info('Routes registered successfully');
  } catch (error) {
    fastify.log.error('Failed to register routes:', error);
    process.exit(1);
  }
}

// Start server
async function start() {
  try {
    const port = parseInt(process.env.PORT || '3001');
    const host = process.env.HOST || '0.0.0.0';

    await registerPlugins();
    await registerRoutes();

    await fastify.listen({ port, host });
    
    fastify.log.info(`Server listening on ${host}:${port}`);
    fastify.log.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  } catch (error) {
    fastify.log.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  fastify.log.info('Received SIGINT, shutting down gracefully...');
  await fastify.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  fastify.log.info('Received SIGTERM, shutting down gracefully...');
  await fastify.close();
  process.exit(0);
});

// Start the server
start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
