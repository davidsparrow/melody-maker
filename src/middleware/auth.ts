import { FastifyRequest, FastifyReply } from 'fastify';

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  try {
    // Verify JWT token
    await request.jwtVerify();
    
    // Add user info to request
    const user = request.user as { id: string; email: string; plan: string };
    request.user = user;
    
  } catch (error) {
    return reply.status(401).send({
      success: false,
      error: 'Unauthorized',
      message: 'Invalid or expired authentication token',
    });
  }
}

// Optional auth middleware for endpoints that can work with or without auth
export async function optionalAuthMiddleware(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
    const user = request.user as { id: string; email: string; plan: string };
    request.user = user;
  } catch (error) {
    // Don't fail, just don't set user
    request.user = null;
  }
}

// Rate limiting middleware
export async function rateLimitMiddleware(request: FastifyRequest, reply: FastifyReply) {
  const clientId = request.ip || 'unknown';
  const key = `rate_limit:${clientId}`;
  
  // TODO: Implement Redis-based rate limiting
  // For now, just allow all requests
  // In production, implement proper rate limiting:
  // - 10 requests per minute for general endpoints
  // - 5 requests per minute for generation endpoints
  // - 2 requests per minute for analysis endpoints
  
  return;
}
