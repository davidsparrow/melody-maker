'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useProjectStore } from '@/store/projectStore';
import { Plus, Music, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { DashboardProjectCard } from '@/components/dashboard/DashboardProjectCard';
import { CreateProjectModal } from '@/components/dashboard/CreateProjectModal';
import { useUIStore } from '@/store/uiStore';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { projects, isLoadingProjects, projectsError, setProjectsLoading, setProjectsError } = useProjectStore();
  const { isUploadModalOpen, setUploadModalOpen } = useUIStore();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Load projects on mount
  useEffect(() => {
    if (isAuthenticated) {
      loadProjects();
    }
  }, [isAuthenticated]);

  const loadProjects = async () => {
    try {
      setProjectsLoading(true);
      setProjectsError(null);
      
      // TODO: Replace with actual API call
      // const response = await apiClient.getProjects();
      // if (response.success && response.data) {
      //   setProjects(response.data);
      // }
      
      // Mock data for now
      const mockProjects = [
        {
          id: '1',
          userId: user?.id || '',
          title: 'Summer Vibes Track',
          status: 'completed',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T11:30:00Z',
        },
        {
          id: '2',
          userId: user?.id || '',
          title: 'Late Night Session',
          status: 'analyzing',
          createdAt: '2024-01-14T20:00:00Z',
          updatedAt: '2024-01-14T20:15:00Z',
        },
      ];
      
      setProjects(mockProjects);
    } catch (error) {
      setProjectsError(error instanceof Error ? error.message : 'Failed to load projects');
    } finally {
      setProjectsLoading(false);
    }
  };

  const handleCreateProject = () => {
    setUploadModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {user?.email}. Manage your projects and create new AI-generated sections.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Music className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {projects.filter(p => p.status === 'analyzing' || p.status === 'generating').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
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
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Your Projects</h2>
              <button
                onClick={handleCreateProject}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </button>
            </div>
          </div>

          <div className="p-6">
            {isLoadingProjects ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : projectsError ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">{projectsError}</p>
                <button
                  onClick={loadProjects}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12">
                <Music className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                <p className="text-gray-600 mb-6">
                  Create your first project to start generating AI-powered song sections.
                </p>
                <button
                  onClick={handleCreateProject}
                  className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Project
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {projects.map((project) => (
                  <DashboardProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal />
    </div>
  );
}
