import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authMiddleware } from '../middleware/auth';
import { BillingService } from '../services/billingService';

export async function billingRoutes(fastify: FastifyInstance) {
  const billingService = new BillingService();

  // Get user billing info
  fastify.get('/info', {
    preHandler: [authMiddleware],
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = request.user!.id;

        const billingInfo = await billingService.getUserBillingInfo(userId);

        return reply.send({
          success: true,
          data: billingInfo,
        });
      } catch (error) {
        request.log.error('Failed to get billing info:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to get billing info',
          message: error instanceof Error ? error.message : 'Internal server error',
        });
      }
    },
  });

  // Create checkout session
  fastify.post('/checkout', {
    preHandler: [authMiddleware],
    schema: {
      body: {
        type: 'object',
        required: ['planId'],
        properties: {
          planId: { type: 'string' },
          successUrl: { type: 'string', format: 'uri' },
          cancelUrl: { type: 'string', format: 'uri' },
        },
      },
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { planId, successUrl, cancelUrl } = request.body as any;
        const userId = request.user!.id;

        const checkoutSession = await billingService.createCheckoutSession({
          userId,
          planId,
          successUrl,
          cancelUrl,
        });

        return reply.send({
          success: true,
          data: {
            sessionId: checkoutSession.id,
            url: checkoutSession.url,
          },
        });
      } catch (error) {
        request.log.error('Failed to create checkout session:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to create checkout session',
          message: error instanceof Error ? error.message : 'Internal server error',
        });
      }
    },
  });

  // Stripe webhook
  fastify.post('/webhooks/stripe', {
    config: {
      rawBody: true, // Get raw body for signature verification
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const signature = request.headers['stripe-signature'] as string;
        const rawBody = request.rawBody as Buffer;

        if (!signature || !rawBody) {
          return reply.status(400).send({
            success: false,
            error: 'Missing signature or body',
          });
        }

        await billingService.handleStripeWebhook(rawBody, signature);

        return reply.send({ received: true });
      } catch (error) {
        request.log.error('Failed to handle Stripe webhook:', error);
        return reply.status(400).send({
          success: false,
          error: 'Webhook signature verification failed',
        });
      }
    },
  });
}
