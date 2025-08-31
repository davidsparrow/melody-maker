import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req;

  switch (method) {
    case 'POST':
      const { projectId, userId } = req.body;
      
      if (!projectId || !userId) {
        return res.status(400).json({ error: 'projectId and userId are required' });
      }

      // Mock analysis job creation
      const analysisJob = {
        id: Date.now().toString(),
        projectId,
        userId,
        kind: 'analysis',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        attempts: 0,
        maxAttempts: 3
      };

      return res.status(200).json(analysisJob);

    case 'GET':
      const { projectId: queryProjectId, userId: queryUserId } = req.query;
      
      if (!queryProjectId || !queryUserId) {
        return res.status(400).json({ error: 'projectId and userId are required' });
      }

      // Mock analysis results
      const analysis = {
        id: Date.now().toString(),
        projectId: queryProjectId,
        assetId: 'mock-asset-id',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        features: {
          bpm: 120,
          key: 'C',
          mode: 'major',
          duration: 180.5,
          energy: 0.7,
          valence: 0.6,
          danceability: 0.8
        },
        sections: [
          {
            start: 0,
            end: 30,
            type: 'intro',
            confidence: 0.9
          },
          {
            start: 30,
            end: 90,
            type: 'verse',
            confidence: 0.85
          },
          {
            start: 90,
            end: 150,
            type: 'chorus',
            confidence: 0.95
          },
          {
            start: 150,
            end: 180.5,
            type: 'outro',
            confidence: 0.8
          }
        ]
      };

      return res.status(200).json(analysis);

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: `Method ${method} Not Allowed` });
  }
}
