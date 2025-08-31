import type { VercelRequest, VercelResponse } from '@vercel/node';

// Mock project data for testing
const mockProjects = [
  {
    id: '1',
    title: 'Test Project 1',
    description: 'A test project for development',
    userId: 'user123',
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assets: [],
    analysis: null,
    generations: []
  }
];

export default function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req;

  switch (method) {
    case 'GET':
      // Get all projects (with optional filtering)
      const { userId, status } = req.query;
      
      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      let filteredProjects = mockProjects.filter(p => p.userId === userId);
      
      if (status) {
        filteredProjects = filteredProjects.filter(p => p.status === status);
      }

      return res.status(200).json({
        projects: filteredProjects,
        total: filteredProjects.length,
        page: 1,
        limit: 20
      });

    case 'POST':
      // Create new project
      const { title, description, userId: newUserId } = req.body;
      
      if (!title || !newUserId) {
        return res.status(400).json({ error: 'Title and userId are required' });
      }

      const newProject = {
        id: Date.now().toString(),
        title,
        description: description || '',
        userId: newUserId,
        status: 'draft' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        assets: [],
        analysis: null,
        generations: []
      };

      mockProjects.push(newProject);
      return res.status(201).json(newProject);

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: `Method ${method} Not Allowed` });
  }
}
