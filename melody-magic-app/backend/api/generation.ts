import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req;

  switch (method) {
    case 'POST':
      const { projectId, sectionType, style, instrumentation, duration, userId, count = 1 } = req.body;
      
      if (!projectId || !sectionType || !userId) {
        return res.status(400).json({ error: 'projectId, sectionType, and userId are required' });
      }

      // Mock generation job creation
      const generationJob = {
        id: Date.now().toString(),
        projectId,
        userId,
        kind: 'generation',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        payload: {
          sectionType,
          style,
          instrumentation,
          duration,
          userId,
          count
        },
        attempts: 0,
        maxAttempts: 3
      };

      return res.status(200).json(generationJob);

    case 'GET':
      const { projectId: queryProjectId, userId: queryUserId, sectionType, status } = req.query;
      
      if (!queryProjectId || !queryUserId) {
        return res.status(400).json({ error: 'projectId and userId are required' });
      }

      // Mock generation results
      const generations = [
        {
          id: Date.now().toString(),
          projectId: queryProjectId,
          userId: queryUserId,
          kind: 'generation',
          status: 'completed',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          result: {
            id: Date.now().toString(),
            projectId: queryProjectId,
            sectionType: sectionType || 'intro',
            s3Key: `generations/${queryProjectId}/mock-generation.wav`,
            provider: 'mock-ai',
            model: 'melody-magic-v1',
            generationTime: 5.2,
            quality: 0.85,
            metadata: {
              style: 'pop',
              instrumentation: 'piano, drums, bass',
              duration: 30
            }
          }
        }
      ];

      return res.status(200).json(generations);

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: `Method ${method} Not Allowed` });
  }
}
