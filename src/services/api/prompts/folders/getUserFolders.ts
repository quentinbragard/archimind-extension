import { apiClient } from "../../ApiClient";

/**
   * Get user folders
   */
export async function getUserFolders(): Promise<any> {
    try {
      const response = await apiClient.request('/prompts/folders?type=user', {
        method: 'GET'
      });
      
      console.log('User folders response:', response);
      return response;
    } catch (error) {
      console.error('Error fetching user folders:', error);
      return { 
        success: false, 
        folders: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }