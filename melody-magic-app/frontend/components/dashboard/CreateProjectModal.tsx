'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Upload, Music } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useProject } from '@/hooks/useProject';
import { AUDIO_CONFIG } from '@/lib/config';

export function CreateProjectModal() {
  const { isUploadModalOpen, setUploadModalOpen } = useUIStore();
  const { createProject, uploadAudio, analyzeAudio } = useProject();
  const router = useRouter();
  
  const [projectTitle, setProjectTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<'create' | 'upload' | 'analyze'>('create');
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file
      if (file.size > AUDIO_CONFIG.maxFileSize) {
        setError(`File size must be less than ${AUDIO_CONFIG.maxFileSize / (1024 * 1024)} MB`);
        return;
      }
      
      if (!AUDIO_CONFIG.supportedFormats.includes(file.type)) {
        setError('Please select a valid audio file (MP3 or WAV)');
        return;
      }
      
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleCreateProject = async () => {
    if (!projectTitle.trim()) {
      setError('Please enter a project title');
      return;
    }

    try {
      setIsCreating(true);
      setError(null);
      
      // Create project
      const project = await createProject({ title: projectTitle });
      
      if (selectedFile) {
        setCurrentStep('upload');
        
        // Upload audio file
        const assetId = await uploadAudio(selectedFile);
        
        setCurrentStep('analyze');
        
        // Start analysis
        await analyzeAudio(assetId);
        
        // Redirect to project page
        router.push(`/project/${project.id}`);
      } else {
        // Just create project without audio
        router.push(`/project/${project.id}`);
      }
      
      handleClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create project');
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setUploadModalOpen(false);
    setProjectTitle('');
    setSelectedFile(null);
    setError(null);
    setCurrentStep('create');
    setUploadProgress(0);
  };

  if (!isUploadModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {currentStep === 'create' && 'Create New Project'}
            {currentStep === 'upload' && 'Upload Audio File'}
            {currentStep === 'analyze' && 'Analyzing Audio'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isCreating}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {currentStep === 'create' && (
            <div className="space-y-4">
              <div>
                <label htmlFor="projectTitle" className="block text-sm font-medium text-gray-700 mb-2">
                  Project Title
                </label>
                <input
                  type="text"
                  id="projectTitle"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="Enter project title..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={isCreating}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Audio File (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="audioFile"
                    disabled={isCreating}
                  />
                  <label htmlFor="audioFile" className="cursor-pointer">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      {selectedFile ? selectedFile.name : 'Click to select audio file'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      MP3 or WAV, max {AUDIO_CONFIG.maxFileSize / (1024 * 1024)} MB
                    </p>
                  </label>
                </div>
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  disabled={isCreating}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateProject}
                  disabled={isCreating || !projectTitle.trim()}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isCreating ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </div>
          )}

          {currentStep === 'upload' && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Uploading Audio File</h3>
              <p className="text-gray-600">Please wait while we upload your file...</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {currentStep === 'analyze' && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Analyzing Audio</h3>
              <p className="text-gray-600">Our AI is analyzing your track for BPM, key, and structure...</p>
              <div className="flex items-center justify-center space-x-2 mt-4">
                <Music className="h-5 w-5 text-purple-600 animate-pulse" />
                <span className="text-sm text-gray-500">Processing...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
