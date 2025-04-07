// src/hooks/prompts/actions/useFolderMutations.ts
import { useMutation, useQueryClient } from 'react-query';
import { toast } from 'sonner';
import { promptApi } from '@/services/api';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { useSafeQuery } from '@/providers/QueryProvider';

interface FolderData {
  name: string;
  path: string;
  description?: string;
}

interface TogglePinParams {
  folderId: number;
  isPinned: boolean;
  type: 'official' | 'organization';
}

/**
 * Hook that provides mutations for folder CRUD operations with fallback
 */
export function useFolderMutations() {
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
      console.warn("QueryClient not available. Some features may be limited.");
    }
  }
  
  // Invalidate relevant queries after folder operations if queryClient is available
  const invalidateFolderQueries = () => {
    if (queryClient) {
      queryClient.invalidateQueries(QUERY_KEYS.USER_FOLDERS);
      queryClient.invalidateQueries(QUERY_KEYS.ALL_FOLDERS);
    }
  };
  
  // Create folder mutation - with direct API fallback if useMutation isn't available
  const createFolder = (() => {
    try {
      return useMutation(
        async (data: FolderData) => {
          const response = await promptApi.createFolder(data);
          if (!response.success) {
            throw new Error(response.error || 'Failed to create folder');
          }
          return response.folder;
        },
        {
          onSuccess: () => {
            invalidateFolderQueries();
          },
          onError: (error: Error) => {
            console.error('Error creating folder:', error);
            toast.error(`Failed to create folder: ${error.message}`);
          }
        }
      );
    } catch (error) {
      // Fallback for when React Query isn't available
      console.warn("Using direct API fallback for createFolder");
      return {
        mutateAsync: async (data: FolderData) => {
          try {
            const response = await promptApi.createFolder(data);
            if (!response.success) {
              throw new Error(response.error || 'Failed to create folder');
            }
            return response.folder;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error creating folder:', error);
            toast.error(`Failed to create folder: ${errorMessage}`);
            throw error;
          }
        },
        isLoading: false,
        reset: () => {}
      };
    }
  })();

  // Toggle folder pin status - with direct API fallback
  const toggleFolderPin = (() => {
    try {
      return useMutation(
        async ({ folderId, isPinned, type }: TogglePinParams) => {
          const response = await promptApi.toggleFolderPin(folderId, isPinned, type);
          if (!response.success) {
            throw new Error(response.error || 'Failed to update pin status');
          }
          return response.data;
        },
        {
          onSuccess: () => {
            if (queryClient) {
              queryClient.invalidateQueries(QUERY_KEYS.PINNED_FOLDERS);
              queryClient.invalidateQueries(QUERY_KEYS.USER_METADATA);
            }
          },
          onError: (error: Error) => {
            console.error('Error toggling pin status:', error);
            toast.error(`Failed to update pin status: ${error.message}`);
          }
        }
      );
    } catch (error) {
      // Fallback
      return {
        mutateAsync: async ({ folderId, isPinned, type }: TogglePinParams) => {
          try {
            const response = await promptApi.toggleFolderPin(folderId, isPinned, type);
            if (!response.success) {
              throw new Error(response.error || 'Failed to update pin status');
            }
            return response.data;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error toggling pin status:', error);
            toast.error(`Failed to update pin status: ${errorMessage}`);
            throw error;
          }
        },
        isLoading: false,
        reset: () => {}
      };
    }
  })();
  
  // Delete folder mutation - with direct API fallback
  const deleteFolder = (() => {
    try {
      return useMutation(
        async (id: number) => {
          const response = await promptApi.deleteFolder(id);
          if (!response.success) {
            throw new Error(response.error || 'Failed to delete folder');
          }
          return id;
        },
        {
          onSuccess: () => {
            invalidateFolderQueries();
            // Also invalidate template queries since templates may be orphaned
            if (queryClient) {
              queryClient.invalidateQueries(QUERY_KEYS.USER_TEMPLATES);
              queryClient.invalidateQueries(QUERY_KEYS.UNORGANIZED_TEMPLATES);
            }
          },
          onError: (error: Error) => {
            console.error('Error deleting folder:', error);
            toast.error(`Failed to delete folder: ${error.message}`);
          }
        }
      );
    } catch (error) {
      // Fallback
      return {
        mutateAsync: async (id: number) => {
          try {
            const response = await promptApi.deleteFolder(id);
            if (!response.success) {
              throw new Error(response.error || 'Failed to delete folder');
            }
            return id;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error deleting folder:', error);
            toast.error(`Failed to delete folder: ${errorMessage}`);
            throw error;
          }
        },
        isLoading: false,
        reset: () => {}
      };
    }
  })();
  
  return {
    createFolder,
    deleteFolder,
    toggleFolderPin
  };
}