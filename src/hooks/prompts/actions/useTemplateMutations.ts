// src/hooks/prompts/actions/useTemplateMutations.ts
import { useMutation, useQueryClient } from 'react-query';
import { toast } from 'sonner';
import { promptApi } from '@/services/api';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { Template } from '@/types/prompts/templates';
import { useSafeQuery } from '@/providers/QueryProvider';

interface TemplateData {
  title: string;
  content: string;
  description?: string;
  folder_id?: number | null;
  tags?: string[];
  locale?: string;
}

/**
 * Hook that provides mutations for template CRUD operations with fallbacks
 */
export function useTemplateMutations() {
  // Use our safe query to handle case where QueryClient isn't available
  const { isQueryAvailable, queryClient: safeQueryClient } = useSafeQuery();
  
  // Try to get queryClient from React Query context first
  let queryClient;
  try {
    queryClient = useQueryClient();
  } catch (error) {
    // If that fails, use our safe queryClient
    queryClient = safeQueryClient;
    
    if (!isQueryAvailable) {
      console.warn("QueryClient not available in useTemplateMutations. Some features may be limited.");
    }
  }
  
  // Invalidate all template-related queries if queryClient is available
  const invalidateTemplateQueries = () => {
    if (queryClient) {
      queryClient.invalidateQueries(QUERY_KEYS.USER_FOLDERS);
      queryClient.invalidateQueries(QUERY_KEYS.USER_TEMPLATES);
      queryClient.invalidateQueries(QUERY_KEYS.UNORGANIZED_TEMPLATES);
    }
  };
  
  // Create template mutation
  const createTemplate = (() => {
    try {
      return useMutation(
        async (data: TemplateData) => {
          const response = await promptApi.createTemplate(data);
          if (!response.success) {
            throw new Error(response.error || 'Failed to create template');
          }
          return response.template;
        },
        {
          onSuccess: () => {
            invalidateTemplateQueries();
          },
          onError: (error: Error) => {
            console.error('Error creating template:', error);
            toast.error(`Failed to create template: ${error.message}`);
          }
        }
      );
    } catch (error) {
      // Fallback for when React Query isn't available
      console.warn("Using direct API fallback for createTemplate");
      return {
        mutateAsync: async (data: TemplateData) => {
          try {
            const response = await promptApi.createTemplate(data);
            if (!response.success) {
              throw new Error(response.error || 'Failed to create template');
            }
            return response.template;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error creating template:', error);
            toast.error(`Failed to create template: ${errorMessage}`);
            throw error;
          }
        },
        isLoading: false,
        reset: () => {}
      };
    }
  })();
  
  // Update template mutation
  const updateTemplate = (() => {
    try {
      return useMutation(
        async ({ id, data }: { id: number; data: Partial<TemplateData> }) => {
          const response = await promptApi.updateTemplate(id, data);
          if (!response.success) {
            throw new Error(response.error || 'Failed to update template');
          }
          return response.template;
        },
        {
          onSuccess: () => {
            invalidateTemplateQueries();
          },
          onError: (error: Error) => {
            console.error('Error updating template:', error);
            toast.error(`Failed to update template: ${error.message}`);
          }
        }
      );
    } catch (error) {
      // Fallback
      return {
        mutateAsync: async ({ id, data }: { id: number; data: Partial<TemplateData> }) => {
          try {
            const response = await promptApi.updateTemplate(id, data);
            if (!response.success) {
              throw new Error(response.error || 'Failed to update template');
            }
            return response.template;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error updating template:', error);
            toast.error(`Failed to update template: ${errorMessage}`);
            throw error;
          }
        },
        isLoading: false,
        reset: () => {}
      };
    }
  })();
  
  // Delete template mutation
  const deleteTemplate = (() => {
    try {
      return useMutation(
        async (id: number) => {
          const response = await promptApi.deleteTemplate(id);
          if (!response.success) {
            throw new Error(response.error || 'Failed to delete template');
          }
          return id;
        },
        {
          onSuccess: () => {
            invalidateTemplateQueries();
          },
          onError: (error: Error) => {
            console.error('Error deleting template:', error);
            toast.error(`Failed to delete template: ${error.message}`);
          }
        }
      );
    } catch (error) {
      // Fallback
      return {
        mutateAsync: async (id: number) => {
          try {
            const response = await promptApi.deleteTemplate(id);
            if (!response.success) {
              throw new Error(response.error || 'Failed to delete template');
            }
            return id;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error deleting template:', error);
            toast.error(`Failed to delete template: ${errorMessage}`);
            throw error;
          }
        },
        isLoading: false,
        reset: () => {}
      };
    }
  })();
  
  // Track template usage
  const trackTemplateUsage = (() => {
    try {
      return useMutation(
        async (id: number) => {
          return await promptApi.trackTemplateUsage(id);
        },
        {
          onSuccess: () => {
            // Silently update template data
            if (queryClient) {
              queryClient.invalidateQueries(QUERY_KEYS.USER_TEMPLATES);
            }
          },
          onError: (error: Error) => {
            console.error('Error tracking template usage:', error);
            // No toast for usage tracking errors
          }
        }
      );
    } catch (error) {
      // Fallback
      return {
        mutateAsync: async (id: number) => {
          try {
            return await promptApi.trackTemplateUsage(id);
          } catch (error) {
            console.error('Error tracking template usage:', error);
            return { success: false };
          }
        },
        isLoading: false,
        reset: () => {}
      };
    }
  })();
  
  return {
    createTemplate,
    updateTemplate,
    deleteTemplate,
    trackTemplateUsage
  };
}