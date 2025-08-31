'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Music, Clock, CheckCircle, AlertCircle, Play } from 'lucide-react';
import type { Project } from '@/types/project';

interface DashboardProjectCardProps {
  project: Project;
}

export function DashboardProjectCard({ project }: DashboardProjectCardProps) {
  const getStatusIcon = () => {
    switch (project.status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'analyzing':
      case 'generating':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Music className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusText = () => {
    switch (project.status) {
      case 'completed':
        return 'Completed';
      case 'analyzing':
        return 'Analyzing Audio';
      case 'generating':
        return 'Generating Sections';
      case 'error':
        return 'Error';
      default:
        return 'Draft';
    }
  };

  const getStatusColor = () => {
    switch (project.status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'analyzing':
      case 'generating':
        return 'bg-blue-100 text-blue-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            {getStatusIcon()}
            <h3 className="text-lg font-medium text-gray-900">{project.title}</h3>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
            <span>Created {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}</span>
            <span>•</span>
            <span>Updated {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </span>
            
            {project.status === 'completed' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Ready to Export
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {project.status === 'completed' && (
            <Link
              href={`/project/${project.id}`}
              className="inline-flex items-center px-3 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
            >
              <Play className="h-4 w-4 mr-2" />
              View
            </Link>
          )}
          
          <Link
            href={`/project/${project.id}`}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
          >
            Open
          </Link>
        </div>
      </div>
      
      {/* Progress indicator for in-progress projects */}
      {(project.status === 'analyzing' || project.status === 'generating') && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Processing...</span>
            <span>This may take a few minutes</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-purple-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      )}
    </div>
  );
}
