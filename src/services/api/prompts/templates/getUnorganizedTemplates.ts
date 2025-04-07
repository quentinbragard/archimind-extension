import { apiClient } from "@/services/api/ApiClient";

/**
 * Get templates with null folder_id (unorganized templates)
 */
export async function getUnorganizedTemplates(): Promise<any> {
    try {
      // Endpoint specifically for templates without a folder
      const response = await apiClient.request('/prompts/templates/unorganized', {
        method: 'GET'
      });
      return response;
    } catch (error) {
      console.error('Error fetching unorganized templates:', error);
      return { 
        success: false, 
        templates: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }