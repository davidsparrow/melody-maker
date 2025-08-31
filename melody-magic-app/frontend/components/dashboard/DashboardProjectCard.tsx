import React from 'react';
import Icon from '../ui/Icon';

interface Project {
  id: string;
  userId: string;
  title: string;
  status: 'draft' | 'uploading' | 'ready_for_analysis' | 'analyzing' | 'ready_for_generation' | 'generating' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

interface DashboardProjectCardProps {
  project: Project;
}

export function DashboardProjectCard({ project }: DashboardProjectCardProps) {
  const getStatusInfo = (status: Project['status']) => {
    switch (status) {
      case 'draft':
        return { label: 'Draft', icon: 'file', color: 'badge-primary' };
      case 'uploading':
        return { label: 'Uploading', icon: 'upload', color: 'badge-info' };
      case 'ready_for_analysis':
        return { label: 'Ready for Analysis', icon: 'search', color: 'badge-info' };
      case 'analyzing':
        return { label: 'Analyzing', icon: 'workflow', color: 'badge-warning' };
      case 'ready_for_generation':
        return { label: 'Ready for Generation', icon: 'music', color: 'badge-info' };
      case 'generating':
        return { label: 'Generating', icon: 'workflow', color: 'badge-warning' };
      case 'completed':
        return { label: 'Completed', icon: 'check', color: 'badge-success' };
      default:
        return { label: 'Unknown', icon: 'file', color: 'badge-primary' };
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const statusInfo = getStatusInfo(project.status);

  return (
    <div className="card p-4 hover:shadow-md transition-shadow cursor-pointer">
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
            <Icon name={statusInfo.icon} size={14} className="mr-1" />
            {statusInfo.label}
          </span>
          <button className="btn btn-ghost btn-sm">
            <Icon name="edit" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
