/**
 * Update an existing template with automatic cache invalidation
 */
import { apiClient } from "@/services/api/ApiClient";

export async function updateTemplate(templateId: number, templateData: any): Promise<any> {
  console.log('Updating template with data:', templateData);
  try {
    // Ensure required fields are present
    if (!templateData.title && !templateData.content) {
      return {
        success: false,
        error: 'At least one field to update is required'
      };
    }
    
    // Add type if not present
    const dataToSend = {
      ...templateData,
      type: templateData.type || 'user'
    };
    
    const response = await apiClient.request(`/prompts/templates/${templateId}`, {
      method: 'PUT',
      body: JSON.stringify(dataToSend)
    });
    
    return response;
  } catch (error) {
    console.error('Error updating template:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}