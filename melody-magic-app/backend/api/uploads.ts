import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req;

  switch (method) {
    case 'POST':
      const { projectId, fileName, fileType, fileSize, userId } = req.body;
      
      if (!projectId || !fileName || !fileType || !fileSize || !userId) {
        return res.status(400).json({ 
          error: 'projectId, fileName, fileType, fileSize, and userId are required' 
        });
      }

      // Mock upload URL generation
      const uploadUrl = {
        uploadUrl: `https://mock-s3-upload-url/uploads/${userId}/${projectId}/${fileName}`,
        s3Key: `uploads/${userId}/${projectId}/${Date.now()}-${fileName}`,
        fields: {
          'Content-Type': fileType,
          'Content-Length': fileSize.toString()
        }
      };

      return res.status(200).json(uploadUrl);

    default:
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({ error: `Method ${method} Not Allowed` });
  }
}
