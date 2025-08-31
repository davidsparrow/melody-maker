'use client';

import React, { useState } from 'react';

// Mock data for demonstration
const mockProjects = [
  {
    id: '1',
    userId: 'user-1',
    title: 'Summer Vibes Track',
    status: 'completed' as const,
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-15T11:30:00Z'),
  },
  {
    id: '2',
    userId: 'user-1',
    title: 'Late Night Session',
    status: 'analyzing' as const,
    createdAt: new Date('2024-01-14T20:00:00Z'),
    updatedAt: new Date('2024-01-14T20:15:00Z'),
  },
  {
    id: '3',
    userId: 'user-1',
    title: 'Acoustic Cover',
    status: 'draft' as const,
    createdAt: new Date('2024-01-13T15:00:00Z'),
    updatedAt: new Date('2024-01-13T15:00:00Z'),
  },
];

export default function DashboardPage() {
  const [projects] = useState(mockProjects);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'draft':
        return { label: 'Draft', color: 'badge-primary' };
      case 'uploading':
        return { label: 'Uploading', color: 'badge-info' };
      case 'ready_for_analysis':
        return { label: 'Ready for Analysis', color: 'badge-info' };
      case 'analyzing':
        return { label: 'Analyzing', color: 'badge-warning' };
      case 'ready_for_generation':
        return { label: 'Ready for Generation', color: 'badge-info' };
      case 'generating':
        return { label: 'Generating', color: 'badge-warning' };
      case 'completed':
        return { label: 'Completed', color: 'badge-success' };
      default:
        return { label: 'Unknown', color: 'badge-primary' };
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back! Manage your projects and create new AI-generated sections.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <div className="w-6 h-6 text-purple-600">🎵</div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <div className="w-6 h-6 text-blue-600">⏱️</div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {projects.filter(p => p.status === 'analyzing' || p.status === 'generating').length}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <div className="w-6 h-6 text-green-600">✅</div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {projects.filter(p => p.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Projects Section */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Your Projects</h2>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="btn btn-primary"
              >
                <span className="mr-2">+</span>
                New Project
              </button>
            </div>
          </div>

          <div className="p-6">
            {projects.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🎵</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                <p className="text-gray-600 mb-6">
                  Create your first project to start generating AI-powered song sections.
                </p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="btn btn-primary btn-lg"
                >
                  <span className="mr-2">+</span>
                  Create Project
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {projects.map((project) => {
                  const statusInfo = getStatusInfo(project.status);
                  return (
                    <div key={project.id} className="card p-4 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-1">{project.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>Created {formatDate(project.createdAt)}</span>
                            <span>Updated {formatDate(project.updatedAt)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`badge ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                          <button className="btn btn-ghost btn-sm">
                            ✏️
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Project Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Create New Project</h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="projectTitle" className="block text-sm font-medium text-gray-700 mb-2">
                    Project Title
                  </label>
                  <input
                    type="text"
                    id="projectTitle"
                    className="input w-full"
                    placeholder="Enter project title..."
                  />
                </div>
                <div>
                  <label htmlFor="projectDescription" className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    id="projectDescription"
                    className="input w-full"
                    rows={3}
                    placeholder="Describe your project..."
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setIsCreateModalOpen(false)}
                    className="btn btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button className="btn btn-primary flex-1">
                    Create Project
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
