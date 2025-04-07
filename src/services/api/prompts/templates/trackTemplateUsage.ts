import { apiClient } from "@/services/api/ApiClient";

/**
 * Track template usage
 * @param templateId - ID of the template being used
 */
export async function trackTemplateUsage(templateId: number): Promise<any> {
    try {
      const response = await apiClient.request(`/prompts/templates/use/${templateId}`, {
        method: 'POST'
      });
      return response;
    } catch (error) {
      console.error('Error tracking template usage:', error);
      return { 
        success: false, 
        usage_count: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }