import { apiClient } from "@/services/api/ApiClient";

/**
 * Delete a template
 */
export async function deleteTemplate(templateId: number): Promise<any> {
    try {
      const response = await apiClient.request(`/prompts/templates/${templateId}`, {
        method: 'DELETE'
      });
      
      return response;
    } catch (error) {
      console.error('Error deleting template:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }