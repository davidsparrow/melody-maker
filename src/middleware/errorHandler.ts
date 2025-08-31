import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';

export async function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { log } = request;

  // Log the error
  log.error(error);

  // Handle specific error types
  if (error.validation) {
    return reply.status(400).send({
      success: false,
      error: 'Validation Error',
      message: 'Request validation failed',
      details: error.validation,
    });
  }

  if (error.statusCode === 413) {
    return reply.status(413).send({
      success: false,
      error: 'File Too Large',
      message: 'The uploaded file exceeds the maximum allowed size (50 MB)',
    });
  }

  if (error.statusCode === 401) {
    return reply.status(401).send({
      success: false,
      error: 'Unauthorized',
      message: 'Authentication required',
    });
  }

  if (error.statusCode === 403) {
    return reply.status(403).send({
      success: false,
      error: 'Forbidden',
      message: 'Access denied',
    });
  }

  if (error.statusCode === 404) {
    return reply.status(404).send({
      success: false,
      error: 'Not Found',
      message: 'The requested resource was not found',
    });
  }

  // Handle rate limiting errors
  if (error.statusCode === 429) {
    return reply.status(429).send({
      success: false,
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
    });
  }

  // Default error response
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  // Don't expose internal errors in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  const errorDetails = isDevelopment ? {
    stack: error.stack,
    code: error.code,
  } : {};

  return reply.status(statusCode).send({
    success: false,
    error: 'Internal Server Error',
    message,
    ...(isDevelopment && errorDetails),
  });
}
