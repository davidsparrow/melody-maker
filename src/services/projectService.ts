import { v4 as uuidv4 } from 'uuid';
import type { 
  Project, 
  CreateProjectRequest, 
  UpdateProjectRequest,
  ProjectsResponse 
} from '../types/project';

interface CreateProjectData extends CreateProjectRequest {
  userId: string;
}

interface GetProjectsOptions {
  page: number;
  limit: number;
  status?: string;
}

export class ProjectService {
  // TODO: Replace with actual database calls
  private projects: Map<string, Project> = new Map();

  async createProject(data: CreateProjectData): Promise<Project> {
    const project: Project = {
      id: uuidv4(),
      userId: data.userId,
      title: data.title,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.projects.set(project.id, project);
    return project;
  }

  async getUserProjects(userId: string, options: GetProjectsOptions): Promise<ProjectsResponse> {
    const { page, limit, status } = options;
    const offset = (page - 1) * limit;

    let filteredProjects = Array.from(this.projects.values())
      .filter(project => project.userId === userId);

    if (status) {
      filteredProjects = filteredProjects.filter(project => project.status === status);
    }

    const total = filteredProjects.length;
    const totalPages = Math.ceil(total / limit);
    const paginatedProjects = filteredProjects.slice(offset, offset + limit);

    return {
      success: true,
      data: paginatedProjects,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async getProject(id: string, userId: string): Promise<Project | null> {
    const project = this.projects.get(id);
    
    if (!project || project.userId !== userId) {
      return null;
    }

    return project;
  }

  async updateProject(id: string, userId: string, updates: UpdateProjectRequest): Promise<Project | null> {
    const project = this.projects.get(id);
    
    if (!project || project.userId !== userId) {
      return null;
    }

    const updatedProject: Project = {
      ...project,
      ...updates,
      updatedAt: new Date(),
    };

    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: string, userId: string): Promise<boolean> {
    const project = this.projects.get(id);
    
    if (!project || project.userId !== userId) {
      return false;
    }

    this.projects.delete(id);
    return true;
  }

  async updateProjectStatus(id: string, status: string): Promise<Project | null> {
    const project = this.projects.get(id);
    
    if (!project) {
      return null;
    }

    const updatedProject: Project = {
      ...project,
      status: status as any,
      updatedAt: new Date(),
    };

    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async getProjectsByStatus(status: string): Promise<Project[]> {
    return Array.from(this.projects.values())
      .filter(project => project.status === status);
  }

  async getProjectCount(userId: string): Promise<number> {
    return Array.from(this.projects.values())
      .filter(project => project.userId === userId).length;
  }
}
