// src/api/PromptApi.ts
import { apiClient } from '@/services/api/ApiClient';
import { Template, TemplateFolder } from '../types';

/**
 * API client for working with prompt templates
 */
class PromptApiClient {
  /**
   * Get prompt template folders by type and optional folder IDs
   * @param type - Type of folders to fetch (official, organization, user)
   * @param folderIds - Optional array of folder IDs to fetch (required for 'official' and 'organization' types)
   * @param empty - Whether to return folders without templates
   */
  async getPromptTemplatesFolders(type: string, folderIds: number[] = [], empty: boolean = false) {
    try {
      // For 'official' and 'organization' types, if no folder IDs are provided, return empty result
      if ((type === 'official' || type === 'organization') && (!folderIds || folderIds.length === 0)) {
        console.log(`No ${type} folder IDs provided, returning empty result`);
        return { success: true, folders: [] };
      }
      
      // Build the endpoint with the proper query parameters
      let endpoint = `/prompts/folders?type=${type}`;
      
      // Add folder_ids as a comma-separated string for efficiency
      if ((type === 'official' || type === 'organization') && folderIds.length > 0) {
        endpoint += `&folder_ids=${folderIds.join(',')}`;
      }
      
      if (empty) {
        endpoint += '&empty=true';
      }
      
      console.log(`Making API request to: ${endpoint}`);
      
      // Use ApiClient to handle auth and error handling
      const response = await apiClient.request(endpoint);
      console.log(`API response for getPromptTemplatesFolders:`, response);
      return response;
    } catch (error) {
      console.error('Error fetching template folders:', error);
      
      // Return a safe default value
      return { 
        success: false, 
        folders: [], 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Get all template folders of a specific type (for browsing)
   * @param type - Type of folders to fetch (official, organization)
   * @param empty - Whether to return folders without templates
   */
  async getAllTemplateFolders(type: string, empty: boolean = false) {
    try {
      console.log(`Fetching all ${type} folders`);
      
      // Use the same endpoint but without folder_ids to get all folders
      const endpoint = `/prompts/folders?type=${type}&empty=${empty ? 'true' : 'false'}`;
      
      console.log(`Making API request to: ${endpoint}`);
      
      // Use ApiClient to handle auth and error handling
      const response = await apiClient.request(endpoint);
      console.log(`API response for getAllTemplateFolders:`, response);
      return response;
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
  
  /**
   * Update a user's pinned folder IDs
   * @param type - Type of folders to update (official or organization)
   * @param folderIds - Array of folder IDs to pin
   */
  async updatePinnedFolders(type: 'official' | 'organization', folderIds: number[]) {
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
      
      console.log(`Updating pinned ${type} folders:`, folderIds);
      
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
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Toggle pin status for a single folder
   * @param folderId - ID of the folder to toggle
   * @param isPinned - Current pin status (true if pinned, false if not)
   * @param type - Type of folder (official or organization)
   */
  async toggleFolderPin(folderId: number, isPinned: boolean, type: 'official' | 'organization') {
    try {
      // Determine which endpoint to use based on current pin status
      const endpoint = isPinned 
        ? `/prompts/folders/unpin/${folderId}` 
        : `/prompts/folders/pin/${folderId}`;
      
      // Create payload with the folder type
      const payload = {
        is_official: type === 'official'
      };
      
      console.log(`${isPinned ? 'Unpinning' : 'Pinning'} ${type} folder: ${folderId}`);
      
      // Make the API request
      const response = await apiClient.request(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      return response;
    } catch (error) {
      console.error(`Error toggling pin for ${type} folder ${folderId}:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
/**
 * Create a new template
 */
async createTemplate(templateData: any) {
  try {
    // Ensure required fields are present
    if (!templateData.title || !templateData.content) {
      return {
        success: false,
        error: 'Title and content are required'
      };
    }
    
    // Create a proper API request body
    const requestBody = {
      title: templateData.title,
      content: templateData.content,
      tags: templateData.tags || [],
      locale: templateData.locale || 'en',
      type: 'user'  // Always creating a user template
    };
    
    // Only add folder_id if it's defined
    if (templateData.folder_id !== undefined && templateData.folder_id !== null) {
      requestBody.folder_id = templateData.folder_id;
    }
    
    console.log('Creating template with data:', requestBody);
    
    const response = await apiClient.request('/prompts/templates', {
      method: 'POST',
      body: JSON.stringify(requestBody)
    });
    
    console.log('Template creation response:', response);
    return response;
  } catch (error) {
    console.error('Error creating template:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}


/**
 * Update an existing template
 */
async updateTemplate(templateId: number, templateData: any) {
  try {
    // Ensure required fields are present
    if (!templateData.title && !templateData.content) {
      return {
        success: false,
        error: 'At least one field to update is required'
      };
    }
    
    console.log(`Updating template ${templateId} with data:`, templateData);
    
    const response = await apiClient.request(`/prompts/templates/${templateId}`, {
      method: 'PUT',
      body: JSON.stringify(templateData)
    });
    
    console.log('Template update response:', response);
    return response;
  } catch (error) {
    console.error('Error updating template:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get user folders
 */
async getUserFolders() {
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

/**
 * Create a new folder
 */
async createFolder(folderData: any) {
  try {
    if (!folderData.name) {
      return {
        success: false,
        error: 'Folder name is required'
      };
    }
    
    console.log('Creating folder with data:', folderData);
    
    const response = await apiClient.request('/prompts/folders', {
      method: 'POST',
      body: JSON.stringify(folderData)
    });
    
    console.log('Folder creation response:', response);
    return response;
  } catch (error) {
    console.error('Error creating folder:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

  /**
   * Delete a folder
   */
  async deleteFolder(folderId: number) {
    try {
      const response = await apiClient.request(`/prompts/folders/${folderId}`, {
        method: 'DELETE'
      });
      return response;
    } catch (error) {
      console.error('Error deleting folder:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get user data from Chrome storage
   */
  async getUserFromStorage() {
    return new Promise<any>((resolve) => {
      chrome.storage.local.get('user', (result) => {
        resolve(result.user || null);
      });
    });
  }

  /**
   * Update user data in Chrome storage
   */
  async updateUserInStorage(userData: any) {
    return new Promise<boolean>((resolve) => {
      chrome.storage.local.set({ user: userData }, () => {
        resolve(true);
      });
    });
  }

  /**
   * Track template usage
   * @param templateId - ID of the template being used
   */
  async trackTemplateUsage(templateId: number) {
    try {
      const response = await apiClient.request(`/prompts/templates/use/${templateId}`, {
        method: 'POST'
      });
      return response;
    } catch (error) {
      console.error('Error tracking template usage:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get user metadata
   */
  async getUserMetadata() {
    try {
      const response = await apiClient.request('/user/metadata');
      console.log("response", response)
      return response;
    } catch (error) {
      console.error('Error getting user metadata:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Export a singleton instance
export const promptApi = new PromptApiClient();