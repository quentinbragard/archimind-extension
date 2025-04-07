import { useQuery } from 'react-query';
import { promptApi } from '@/services/api';
import { toast } from 'sonner';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { Template } from '@/types/prompts/templates';

export function useUserTemplates() {
  return useQuery(QUERY_KEYS.USER_TEMPLATES, async () => {
    const response = await promptApi.getUserTemplates();
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch user templates');
    }
    return response.templates as Template[];
  }, {
    refetchOnWindowFocus: false,
    onError: (error: Error) => {
      toast.error(`Failed to load user templates: ${error.message}`);
    }
  });
} 