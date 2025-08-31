import { useCallback } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { useUIStore } from '@/store/uiStore';
import apiClient from '@/lib/api';
import type { CreateProjectRequest, GenerateRequest } from '@/types/api';

export function useProject() {
  const {
    currentProject,
    setCurrentProject,
    setCurrentAssets,
    setCurrentAnalysis,
    addCurrentJob,
    updateCurrentJob,
    setAnalyzing,
    setGenerating,
    setAnalysisError,
    setGenerationError,
  } = useProjectStore();

  const { addToast, setGlobalLoading } = useUIStore();

  const createProject = useCallback(async (data: CreateProjectRequest) => {
    try {
      setGlobalLoading(true, 'Creating project...');
      const response = await apiClient.createProject(data);
      
      if (response.success && response.data) {
        setCurrentProject(response.data);
        addToast({
          type: 'success',
          title: 'Project created',
          message: 'Your new project has been created successfully.',
        });
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to create project');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create project';
      addToast({
        type: 'error',
        title: 'Project creation failed',
        message,
      });
      throw error;
    } finally {
      setGlobalLoading(false);
    }
  }, [setCurrentProject, addToast, setGlobalLoading]);

  const uploadAudio = useCallback(async (file: File) => {
    if (!currentProject) {
      throw new Error('No project selected');
    }

    try {
      setGlobalLoading(true, 'Getting upload URL...');
      
      // Get presigned upload URL
      const uploadResponse = await apiClient.getUploadUrl(currentProject.id, {
        filename: file.name,
        contentType: file.type,
      });

      if (!uploadResponse.success || !uploadResponse.data) {
        throw new Error(uploadResponse.error || 'Failed to get upload URL');
      }

      setGlobalLoading(true, 'Uploading audio file...');
      
      // Upload to S3
      await apiClient.uploadToS3(
        uploadResponse.data.uploadUrl,
        file,
        (progress) => {
          // Could update progress in UI here
          console.log(`Upload progress: ${progress}%`);
        }
      );

      addToast({
        type: 'success',
        title: 'Upload complete',
        message: 'Audio file uploaded successfully.',
      });

      return uploadResponse.data.assetId;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed';
      addToast({
        type: 'error',
        title: 'Upload failed',
        message,
      });
      throw error;
    } finally {
      setGlobalLoading(false);
    }
  }, [currentProject, addToast, setGlobalLoading]);

  const analyzeAudio = useCallback(async (assetId: string) => {
    if (!currentProject) {
      throw new Error('No project selected');
    }

    try {
      setAnalyzing(true);
      setAnalysisError(null);
      
      const response = await apiClient.analyzeAudio(currentProject.id, { assetId });
      
      if (response.success && response.data) {
        addCurrentJob(response.data);
        addToast({
          type: 'success',
          title: 'Analysis started',
          message: 'Audio analysis is now processing. This may take a few minutes.',
        });
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to start analysis');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Analysis failed';
      setAnalysisError(message);
      addToast({
        type: 'error',
        title: 'Analysis failed',
        message,
      });
      throw error;
    } finally {
      setAnalyzing(false);
    }
  }, [currentProject, setAnalyzing, setAnalysisError, addCurrentJob, addToast]);

  const generateSection = useCallback(async (data: GenerateRequest) => {
    if (!currentProject) {
      throw new Error('No project selected');
    }

    try {
      setGenerating(true);
      setGenerationError(null);
      
      const response = await apiClient.generateSection(currentProject.id, data);
      
      if (response.success && response.data) {
        addCurrentJob(response.data);
        addToast({
          type: 'success',
          title: 'Generation started',
          message: `AI generation of ${data.type} is now processing. This may take a few minutes.`,
        });
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to start generation');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Generation failed';
      setGenerationError(message);
      addToast({
        type: 'error',
        title: 'Generation failed',
        message,
      });
      throw error;
    } finally {
      setGenerating(false);
    }
  }, [currentProject, setGenerating, setGenerationError, addCurrentJob, addToast]);

  const checkJobStatus = useCallback(async (jobId: string) => {
    try {
      const response = await apiClient.getJobStatus(jobId);
      
      if (response.success && response.data) {
        updateCurrentJob(jobId, response.data);
        
        // If job is completed, update project state
        if (response.data.status === 'completed' && response.data.result) {
          if (response.data.kind === 'analysis') {
            // TODO: Parse analysis result and update currentAnalysis
          } else if (response.data.kind === 'generate_intro' || response.data.kind === 'generate_outro') {
            // TODO: Update currentAssets with generated audio
          }
        }
        
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to get job status');
      }
    } catch (error) {
      console.error('Job status check failed:', error);
      throw error;
    }
  }, [updateCurrentJob]);

  return {
    currentProject,
    createProject,
    uploadAudio,
    analyzeAudio,
    generateSection,
    checkJobStatus,
  };
}
