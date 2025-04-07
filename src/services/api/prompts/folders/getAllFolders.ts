import { apiClient } from '@/services/api/ApiClient';
import { getCurrentLanguage } from '@/core/utils/i18n';
import { TemplateFolder } from '@/types/prompts/folders';

interface GetAllFoldersResponse {
  success: boolean;
  folders: TemplateFolder[];
  error?: string;
}

/**
   * Get all template folders of a specific type (for browsing)
   * @param type - Type of folders to fetch (official, organization)
   * @param empty - Whether to return folders without templates
   */
export async function getAllFolders(type: string, empty: boolean = false, locale?: string): Promise<GetAllFoldersResponse> {
    try {
      
      // Get user locale or fallback to default
      const userLocale = locale || getCurrentLanguage();
      
      // Use the same endpoint but add locale parameter
      const endpoint = `/prompts/folders?type=${type}&empty=${empty ? 'true' : 'false'}&locale=${userLocale}`;
      
      // Use ApiClient to handle auth and error handling
      const response = await apiClient.request(endpoint);
      return response as GetAllFoldersResponse;
    } catch (error) {
      console.error(`Error fetching ${type} folders:`, error);
      // Return a safe default value
      return { 
        success: false, 
        folders: [], 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  