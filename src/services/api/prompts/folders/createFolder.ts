/**
* Create a new folder
*/

import { apiClient } from "@/services/api/ApiClient";

export async function createFolder(folderData: { name: string, path: string, description?: string }): Promise<any> {
    try {
      if (!folderData.name) {
        return {
          success: false,
          error: 'Folder name is required'
        };
      }

      const response = await apiClient.request('/prompts/folders', {
        method: 'POST',
        body: JSON.stringify(folderData)
      });
      return response;
    } catch (error) {
      console.error('Error creating folder:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  