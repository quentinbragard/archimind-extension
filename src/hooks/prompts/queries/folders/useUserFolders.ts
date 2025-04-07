// src/hooks/prompts/queries/folders/useUserFolders.ts
import { useQuery } from 'react-query';
import { promptApi } from '@/services/api';
import { toast } from 'sonner';
import { QUERY_KEYS } from '@/constants/queryKeys'; // Updated import
import { TemplateFolder } from '@/types/prompts/templates';

export function useUserFolders() {
  return useQuery(QUERY_KEYS.USER_FOLDERS, async () => {
    const response = await promptApi.getUserFolders();
    if (!response.success) {
      throw new Error(response.error || 'Failed to load user folders');
    }
    
    // Also fetch user templates to properly handle templates with null folder_id
    const templatesResponse = await promptApi.getUserTemplates();
    
    if (templatesResponse.success && templatesResponse.templates) {
      // Create a map of folder ID to folder for easy lookup
      const folderMap = new Map<number, TemplateFolder>();
      response.folders.forEach((folder: TemplateFolder) => {
        folderMap.set(folder.id, folder);
        
        // Initialize templates array if not present
        if (!folder.templates) {
          folder.templates = [];
        }
      });
      
      // Process all templates
      templatesResponse.templates.forEach(template => {
        if (template.folder_id === null) {
          // We'll handle unorganized templates separately
          return;
        } else if (folderMap.has(template.folder_id)) {
          // For templates with a valid folder_id, add to the corresponding folder
          const folder = folderMap.get(template.folder_id);
          if (folder) {
            folder.templates.push(template);
          }
        }
      });
    }
    
    return response.folders;
  }, {
    refetchOnWindowFocus: false,
    onError: (error: Error) => {
      toast.error(`Failed to load user folders: ${error.message}`);
    }
  });
}