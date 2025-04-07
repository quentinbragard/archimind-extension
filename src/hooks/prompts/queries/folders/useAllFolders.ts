import { useQuery } from 'react-query';
import { promptApi } from '@/services/api';
import { toast } from 'sonner';
import { getCurrentLanguage } from '@/core/utils/i18n';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { TemplateFolder } from '@/types/prompts/templates';

export function useAllFolders() {
  const userLocale = getCurrentLanguage();
  
  return useQuery(QUERY_KEYS.ALL_FOLDERS, async () => {
    const [officialResponse, organizationResponse] = await Promise.all([
      promptApi.getAllFolders('official', false, userLocale),
      promptApi.getAllFolders('organization', false, userLocale)
    ]);

    if (!officialResponse.success || !organizationResponse.success) {
      throw new Error('Failed to fetch folders');
    }

    return {
      official: officialResponse.folders as TemplateFolder[],
      organization: organizationResponse.folders as TemplateFolder[]
    };
  }, {
    refetchOnWindowFocus: false,
    onError: (error: Error) => {
      toast.error(`Failed to load folders: ${error.message}`);
    }
  });
} 