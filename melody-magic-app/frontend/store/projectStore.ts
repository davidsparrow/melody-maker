import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Project, AudioAsset, AudioAnalysis, GenerationJob } from '@/types/project';

interface ProjectState {
  // Current project
  currentProject: Project | null;
  currentAssets: AudioAsset[];
  currentAnalysis: AudioAnalysis | null;
  currentJobs: GenerationJob[];
  
  // Project list
  projects: Project[];
  isLoadingProjects: boolean;
  projectsError: string | null;
  
  // Current project state
  isAnalyzing: boolean;
  isGenerating: boolean;
  analysisError: string | null;
  generationError: string | null;
  
  // Actions
  setCurrentProject: (project: Project | null) => void;
  setCurrentAssets: (assets: AudioAsset[]) => void;
  setCurrentAnalysis: (analysis: AudioAnalysis | null) => void;
  addCurrentJob: (job: GenerationJob) => void;
  updateCurrentJob: (jobId: string, updates: Partial<GenerationJob>) => void;
  
  setProjects: (projects: Project[]) => void;
  setProjectsLoading: (loading: boolean) => void;
  setProjectsError: (error: string | null) => void;
  
  setAnalyzing: (analyzing: boolean) => void;
  setGenerating: (generating: boolean) => void;
  setAnalysisError: (error: string | null) => void;
  setGenerationError: (error: string | null) => void;
  
  // Utility actions
  clearCurrentProject: () => void;
  clearErrors: () => void;
}

export const useProjectStore = create<ProjectState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        currentProject: null,
        currentAssets: [],
        currentAnalysis: null,
        currentJobs: [],
        
        projects: [],
        isLoadingProjects: false,
        projectsError: null,
        
        isAnalyzing: false,
        isGenerating: false,
        analysisError: null,
        generationError: null,
        
        // Actions
        setCurrentProject: (project) => set({ currentProject: project }),
        
        setCurrentAssets: (assets) => set({ currentAssets: assets }),
        
        setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis }),
        
        addCurrentJob: (job) => set((state) => ({
          currentJobs: [...state.currentJobs, job]
        })),
        
        updateCurrentJob: (jobId, updates) => set((state) => ({
          currentJobs: state.currentJobs.map(job => 
            job.id === jobId ? { ...job, ...updates } : job
          )
        })),
        
        setProjects: (projects) => set({ projects }),
        
        setProjectsLoading: (loading) => set({ isLoadingProjects: loading }),
        
        setProjectsError: (error) => set({ projectsError: error }),
        
        setAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),
        
        setGenerating: (generating) => set({ isGenerating: generating }),
        
        setAnalysisError: (error) => set({ analysisError: error }),
        
        setGenerationError: (error) => set({ generationError: error }),
        
        // Utility actions
        clearCurrentProject: () => set({
          currentProject: null,
          currentAssets: [],
          currentAnalysis: null,
          currentJobs: [],
        }),
        
        clearErrors: () => set({
          analysisError: null,
          generationError: null,
          projectsError: null,
        }),
      }),
      {
        name: 'melody-magic-project-store',
        partialize: (state) => ({
          // Only persist non-sensitive data
          projects: state.projects,
          currentProject: state.currentProject,
        }),
      }
    )
  )
);
