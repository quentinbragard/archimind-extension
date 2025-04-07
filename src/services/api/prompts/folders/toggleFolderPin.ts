import { apiClient } from "@/services/api/ApiClient";

/**
 * Toggle pin status for a single folder
 * @param folderId - ID of the folder to toggle
 * @param isPinned - Current pin status (true if pinned, false if not)
 * @param type - Type of folder (official or organization)
 */
export async function toggleFolderPin(folderId: number, isPinned: boolean, type: 'official' | 'organization'): Promise<any> {
    try {
      // Determine which endpoint to use based on current pin status
      const endpoint = isPinned 
        ? `/prompts/folders/unpin/${folderId}` 
        : `/prompts/folders/pin/${folderId}`;
      
      // Add the folder_type as a query parameter instead of a JSON payload
      // This is critical for the backend to properly identify the folder type
      const queryParams = `?folder_type=${type}`;
      
      console.log(`${isPinned ? 'Unpinning' : 'Pinning'} ${type} folder ${folderId}`);
      
      // Make the API request with the query parameter
      const response = await apiClient.request(`${endpoint}${queryParams}`, {
        method: 'POST'
      });
      
      return response;
    } catch (error) {
      console.error(`Error toggling pin for ${type} folder ${folderId}:`, error);
      return { 
        success: false, 
        pinned_folders: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
