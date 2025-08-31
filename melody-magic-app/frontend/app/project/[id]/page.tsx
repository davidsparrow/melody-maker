'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface Project {
  id: string;
  userId: string;
  title: string;
  description?: string;
  status: 'draft' | 'uploading' | 'ready_for_analysis' | 'analyzing' | 'ready_for_generation' | 'generating' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

// Mock project data - in real app this would come from API
const mockProjects: Record<string, Project> = {
  '1': {
    id: '1',
    userId: 'user-1',
    title: 'Summer Vibes Track',
    description: 'Upbeat summer track with tropical vibes',
    status: 'completed',
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-15T11:30:00Z'),
  },
  '2': {
    id: '2',
    userId: 'user-1',
    title: 'Late Night Session',
    description: 'Chill electronic track for late night listening',
    status: 'analyzing',
    createdAt: new Date('2024-01-14T20:00:00Z'),
    updatedAt: new Date('2024-01-14T20:15:00Z'),
  },
  '3': {
    id: '3',
    userId: 'user-1',
    title: 'Acoustic Cover',
    description: 'Acoustic guitar cover of a popular song',
    status: 'draft',
    createdAt: new Date('2024-01-13T15:00:00Z'),
    updatedAt: new Date('2024-01-13T15:00:00Z'),
  },
};

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    // Simulate API call to fetch project
    const fetchProject = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      setProject(mockProjects[projectId] || null);
    };
    
    fetchProject();
  }, [projectId]);

  const getStatusInfo = (status: Project['status']) => {
    switch (status) {
      case 'draft':
        return { label: 'Draft', color: 'badge-primary', icon: '📝' };
      case 'uploading':
        return { label: 'Uploading', color: 'badge-info', icon: '📤' };
      case 'ready_for_analysis':
        return { label: 'Ready for Analysis', color: 'badge-info', icon: '🔍' };
      case 'analyzing':
        return { label: 'Analyzing', color: 'badge-warning', icon: '⚡' };
      case 'ready_for_generation':
        return { label: 'Ready for Generation', color: 'badge-info', icon: '🎵' };
      case 'generating':
        return { label: 'Generating', color: 'badge-warning', icon: '🎹' };
      case 'completed':
        return { label: 'Completed', color: 'badge-success', icon: '✅' };
      default:
        return { label: 'Unknown', color: 'badge-primary', icon: '❓' };
    }
  };

  const getNextSteps = (status: Project['status']) => {
    switch (status) {
      case 'draft':
        return 'Upload an audio file to begin analysis';
      case 'uploading':
        return 'File is being uploaded...';
      case 'ready_for_analysis':
        return 'Click "Start Analysis" to analyze your audio';
      case 'analyzing':
        return 'AI is analyzing your track for BPM, key, and structure';
      case 'ready_for_generation':
        return 'Click "Generate Sections" to create AI-powered additions';
      case 'generating':
        return 'AI is generating complementary song sections';
      case 'completed':
        return 'Your generated sections are ready! Download and enjoy.';
      default:
        return 'Unknown status';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('audio/')) {
        alert('Please select an audio file (MP3, WAV, etc.)');
        return;
      }
      
      // Validate file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        alert('File size must be less than 50MB');
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update project status
      if (project) {
        setProject({
          ...project,
          status: 'ready_for_analysis',
          updatedAt: new Date()
        });
      }

      setSelectedFile(null);
      setUploadProgress(0);
      
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleStartAnalysis = async () => {
    if (!project) return;

    setProject({
      ...project,
      status: 'analyzing',
      updatedAt: new Date()
    });

    try {
      // Simulate analysis process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setProject({
        ...project,
        status: 'ready_for_generation',
        updatedAt: new Date()
      });
      
    } catch (error) {
      console.error('Analysis failed:', error);
      setProject({
        ...project,
        status: 'ready_for_analysis',
        updatedAt: new Date()
      });
    }
  };

  const handleStartGeneration = async () => {
    if (!project) return;

    setProject({
      ...project,
      status: 'generating',
      updatedAt: new Date()
    });

    try {
      // Simulate generation process
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      setProject({
        ...project,
        status: 'completed',
        updatedAt: new Date()
      });
      
    } catch (error) {
      console.error('Generation failed:', error);
      setProject({
        ...project,
        status: 'ready_for_generation',
        updatedAt: new Date()
      });
    }
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4" />
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(project.status);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => window.history.back()}
              className="btn btn-ghost"
            >
              ← Back to Dashboard
            </button>
            <span className={`badge ${statusInfo.color} text-lg`}>
              {statusInfo.icon} {statusInfo.label}
            </span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{project.title}</h1>
          {project.description && (
            <p className="text-xl text-gray-600 mb-4">{project.description}</p>
          )}
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <span>Created {formatDate(project.createdAt)}</span>
            <span>Updated {formatDate(project.updatedAt)}</span>
          </div>
        </div>

        {/* Project Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6 text-center">
            <div className="text-3xl mb-2">🎵</div>
            <p className="text-sm font-medium text-gray-600">Status</p>
            <p className="text-lg font-semibold text-gray-900">{statusInfo.label}</p>
          </div>
          <div className="card p-6 text-center">
            <div className="text-3xl mb-2">📁</div>
            <p className="text-sm font-medium text-gray-600">Files</p>
            <p className="text-lg font-semibold text-gray-900">0</p>
          </div>
          <div className="card p-6 text-center">
            <div className="text-3xl mb-2">⏱️</div>
            <p className="text-sm font-medium text-gray-600">Duration</p>
            <p className="text-lg font-semibold text-gray-900">--</p>
          </div>
          <div className="card p-6 text-center">
            <div className="text-3xl mb-2">🎯</div>
            <p className="text-sm font-medium text-gray-600">BPM</p>
            <p className="text-lg font-semibold text-gray-900">--</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - File Upload & Management */}
          <div className="lg:col-span-2 space-y-6">
            {/* File Upload */}
            <div className="card">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Audio Files</h2>
              </div>
              <div className="p-6">
                {project.status === 'draft' ? (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <div className="text-4xl mb-4">🎵</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Audio File</h3>
                      <p className="text-gray-600 mb-4">
                        Upload an MP3 or WAV file to begin analysis. Maximum file size: 50MB
                      </p>
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="audioFile"
                        disabled={isUploading}
                      />
                      <label
                        htmlFor="audioFile"
                        className="btn btn-primary cursor-pointer"
                      >
                        Select Audio File
                      </label>
                    </div>
                    
                    {selectedFile && (
                      <div className="card p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="font-medium text-gray-900">{selectedFile.name}</h4>
                            <p className="text-sm text-gray-500">
                              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          </div>
                          <button
                            onClick={() => setSelectedFile(null)}
                            className="btn btn-ghost btn-sm"
                          >
                            ✕
                          </button>
                        </div>
                        
                        {isUploading && (
                          <div className="mb-4">
                            <div className="flex justify-between text-sm text-gray-600 mb-2">
                              <span>Uploading...</span>
                              <span>{uploadProgress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                              />
                            </div>
                          </div>
                        )}
                        
                        <button
                          onClick={handleUpload}
                          className="btn btn-primary w-full"
                          disabled={isUploading}
                        >
                          {isUploading ? 'Uploading...' : 'Upload File'}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">🎵</div>
                    <p className="text-gray-600">Audio file uploaded and ready for processing</p>
                  </div>
                )}
              </div>
            </div>

            {/* Project Actions */}
            <div className="card">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Actions</h2>
              </div>
              <div className="p-6 space-y-4">
                {project.status === 'ready_for_analysis' && (
                  <button
                    onClick={handleStartAnalysis}
                    className="btn btn-primary w-full"
                  >
                    🚀 Start Audio Analysis
                  </button>
                )}
                
                {project.status === 'ready_for_generation' && (
                  <button
                    onClick={handleStartGeneration}
                    className="btn btn-accent w-full"
                  >
                    🎹 Generate AI Sections
                  </button>
                )}
                
                {project.status === 'completed' && (
                  <div className="space-y-3">
                    <button className="btn btn-success w-full">
                      📥 Download Generated Sections
                    </button>
                    <button className="btn btn-secondary w-full">
                      🔄 Generate More Variations
                    </button>
                  </div>
                )}
                
                {(project.status === 'analyzing' || project.status === 'generating') && (
                  <div className="text-center py-4">
                    <div className="loading-spinner mx-auto mb-4" />
                    <p className="text-gray-600">Processing... This may take a few minutes</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Project Info & Next Steps */}
          <div className="space-y-6">
            {/* Project Info */}
            <div className="card">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Project Info</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <p className="text-gray-900">{project.title}</p>
                </div>
                {project.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <p className="text-gray-900">{project.description}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <span className={`badge ${statusInfo.color}`}>
                    {statusInfo.icon} {statusInfo.label}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                  <p className="text-gray-900">{formatDate(project.createdAt)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Updated</label>
                  <p className="text-gray-900">{formatDate(project.updatedAt)}</p>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="card">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Next Steps</h2>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">{getNextSteps(project.status)}</p>
                
                {/* Progress Steps */}
                <div className="space-y-3">
                  {['draft', 'uploading', 'ready_for_analysis', 'analyzing', 'ready_for_generation', 'generating', 'completed'].map((step, index) => {
                    const isCompleted = ['draft', 'uploading', 'ready_for_analysis', 'analyzing', 'ready_for_generation', 'generating', 'completed'].indexOf(project.status) >= index;
                    const isCurrent = project.status === step;
                    
                    return (
                      <div key={step} className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                          isCompleted 
                            ? 'bg-green-500 text-white' 
                            : isCurrent 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-gray-200 text-gray-500'
                        }`}>
                          {isCompleted ? '✓' : index + 1}
                        </div>
                        <span className={`text-sm ${
                          isCompleted 
                            ? 'text-green-600 font-medium' 
                            : isCurrent 
                              ? 'text-blue-600 font-medium' 
                              : 'text-gray-500'
                        }`}>
                          {step.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
