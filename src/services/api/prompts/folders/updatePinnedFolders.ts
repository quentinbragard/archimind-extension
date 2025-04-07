/**
 * Update a user's pinned folder IDs
 * @param type - Type of folders to update (official or organization)
 * @param folderIds - Array of folder IDs to pin
 */

import { apiClient } from "@/services/api/ApiClient";

export async function updatePinnedFolders(type: 'official' | 'organization', folderIds: number[]): Promise<any> {
    try {
      // Determine which endpoint to use based on folder type
      const endpoint = type === 'official' 
        ? '/prompts/folders/update-pinned' 
        : '/prompts/folders/update-pinned';
      
      // Create payload with the required fields
      const payload = {
        official_folder_ids: type === 'official' ? folderIds : [],
        organization_folder_ids: type === 'organization' ? folderIds : []
      };
            
      // Use your existing API endpoint
      const response = await apiClient.request(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      return response;
    } catch (error) {
      console.error(`Error updating pinned ${type} folders:`, error);
      return { 
        success: false, 
        pinned_folders: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  