import { useQuery } from 'react-query';
import { promptApi } from '@/services/api';
import { toast } from 'sonner';
import { getCurrentLanguage } from '@/core/utils/i18n';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { TemplateFolder } from '@/types/prompts/templates';

/**
 * Hook to fetch all folders of a specific type (official or organization)
 */
export function useAllFoldersOfType(folderType: 'official' | 'organization') {
  const userLocale = getCurrentLanguage();
  
  return useQuery(
    [QUERY_KEYS.ALL_FOLDERS, folderType], // Query key array with type
    async () => {
      const response = await promptApi.getAllFolders(folderType, false, userLocale);
      
      if (!response.success) {
        throw new Error(response.error || `Failed to fetch ${folderType} folders`);
      }
      
      return response.folders as TemplateFolder[];
    },
    {
      refetchOnWindowFocus: false,
      onError: (error: Error) => {
        toast.error(`Failed to load ${folderType} folders: ${error.message}`);
      }
    }
  );
}