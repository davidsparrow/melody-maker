import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface UIState {
  // Modal states
  isUploadModalOpen: boolean;
  isGenerationModalOpen: boolean;
  isSettingsModalOpen: boolean;
  
  // Sidebar states
  isSidebarOpen: boolean;
  sidebarView: 'projects' | 'settings' | 'billing';
  
  // Toast notifications
  toasts: Toast[];
  
  // Loading states
  isGlobalLoading: boolean;
  loadingMessage: string | null;
  
  // Actions
  setUploadModalOpen: (open: boolean) => void;
  setGenerationModalOpen: (open: boolean) => void;
  setSettingsModalOpen: (open: boolean) => void;
  
  setSidebarOpen: (open: boolean) => void;
  setSidebarView: (view: 'projects' | 'settings' | 'billing') => void;
  
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  
  setGlobalLoading: (loading: boolean, message?: string) => void;
}

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

export const useUIStore = create<UIState>()(
  devtools(
    (set, get) => ({
      // Initial state
      isUploadModalOpen: false,
      isGenerationModalOpen: false,
      isSettingsModalOpen: false,
      
      isSidebarOpen: false,
      sidebarView: 'projects',
      
      toasts: [],
      isGlobalLoading: false,
      loadingMessage: null,
      
      // Actions
      setUploadModalOpen: (open) => set({ isUploadModalOpen: open }),
      
      setGenerationModalOpen: (open) => set({ isGenerationModalOpen: open }),
      
      setSettingsModalOpen: (open) => set({ isSettingsModalOpen: open }),
      
      setSidebarOpen: (open) => set({ isSidebarOpen: open }),
      
      setSidebarView: (view) => set({ sidebarView: view }),
      
      addToast: (toast) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newToast: Toast = {
          id,
          duration: 5000,
          ...toast,
        };
        
        set((state) => ({
          toasts: [...state.toasts, newToast]
        }));
        
        // Auto-remove toast after duration
        if (newToast.duration) {
          setTimeout(() => {
            get().removeToast(id);
          }, newToast.duration);
        }
      },
      
      removeToast: (id) => set((state) => ({
        toasts: state.toasts.filter(toast => toast.id !== id)
      })),
      
      clearToasts: () => set({ toasts: [] }),
      
      setGlobalLoading: (loading, message) => set({
        isGlobalLoading: loading,
        loadingMessage: message || null,
      }),
    })
  )
);
