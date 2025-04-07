// src/hooks/templates/useTemplateEditor.ts

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { promptApi } from '@/services/api/PromptApi';

/**
 * Default form data structure
 */
const DEFAULT_FORM_DATA = {
  name: '',
  content: '',
  description: '',
  folder: '',
  folder_id: undefined,
  based_on_official_id: null
};

/**
 * Hook for managing template editing with improved validation and folder handling
 */
export function useTemplateEditor(onSaveSuccess?: () => Promise<void>) {
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
  const [templateFormData, setTemplateFormData] = useState(DEFAULT_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  
  // Function to update form data with validation
  const updateFormData = useCallback((newData: any) => {
    console.log('Updating template form data:', newData);
    
    setTemplateFormData(prevData => {
      const updatedData = { ...prevData, ...newData };
      
      // Clear validation errors for updated fields
      if (newData.name && validationErrors.name) {
        setValidationErrors(prev => ({ ...prev, name: '' }));
      }
      
      if (newData.content && validationErrors.content) {
        setValidationErrors(prev => ({ ...prev, content: '' }));
      }
      
      return updatedData;
    });
  }, [validationErrors]);
  
  // Validate form data
  const validateForm = useCallback((data: any) => {
    const errors: {[key: string]: string} = {};
    
    if (!data.name?.trim()) {
      errors.name = 'Template name is required';
    }
    
    if (!data.content?.trim()) {
      errors.content = 'Template content is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, []);
  
  // Open editor for a new or existing template
  const openEditor = useCallback((template: any | null, initialFolder?: string) => {
    setSelectedTemplate(template);
    setValidationErrors({});
    
    // Initialize form data from template or defaults
    let formData;
    
    if (template) {
      formData = {
        name: template.title || '',
        content: template.content || '',
        description: template.description || '',
        folder: template.folder || '',
        folder_id: template.folder_id,
        based_on_official_id: null
      };
    } else {
      formData = { ...DEFAULT_FORM_DATA };
      
      // Set initial folder if provided
      if (initialFolder) {
        formData.folder = initialFolder;
      }
    }
    
    setTemplateFormData(formData);
    console.log('Template editor initialized with:', formData);
  }, []);
  
  // Create a new folder during template creation
  const createFolder = useCallback(async (folderName: string) => {
    try {
      // Create a simple folder path from name (lowercase, spaces to dashes)
      const folderPath = folderName.toLowerCase().replace(/\s+/g, '-');
      
      const response = await promptApi.createFolder({
        name: folderName,
        path: folderPath,
        description: `Folder for ${folderName} templates`
      });
      
      if (response.success && response.folder) {
        toast.success(`Folder "${folderName}" created`);
        
        // Update form data with new folder
        updateFormData({
          folder: folderName,
          folder_id: response.folder.id
        });
        
        return response.folder;
      } else {
        toast.error(`Failed to create folder: ${response.error || 'Unknown error'}`);
        return null;
      }
    } catch (error) {
      console.error('Error creating folder:', error);
      toast.error('Error creating folder');
      return null;
    }
  }, [updateFormData]);
  
  // Close the editor
  const closeEditor = useCallback(() => {
    setSelectedTemplate(null);
    setTemplateFormData({ ...DEFAULT_FORM_DATA });
    setError(null);
    setValidationErrors({});
  }, []);
  
  // Save template (create or update) with improved validation
  const saveTemplate = useCallback(async () => {
    console.log('Saving template with data:', templateFormData);
    
    // Form validation
    if (!validateForm(templateFormData)) {
      // This will show validation errors without a toast
      return false;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Prepare template data for backend with proper normalization
      const templateData = {
        title: templateFormData.name.trim(),  // Backend expects 'title'
        content: templateFormData.content.trim(),
        folder_id: templateFormData.folder_id,
        // Include description if backend supports it
        description: templateFormData.description?.trim(),
        tags: [],
        locale: chrome.i18n?.getUILanguage() || 'en'
      };
      
      console.log('Sending template data to API:', templateData);
      
      let response;
      
      if (selectedTemplate?.id) {
        // Update existing template
        response = await promptApi.updateTemplate(selectedTemplate.id, templateData);
      } else {
        // Create new template
        response = await promptApi.createTemplate(templateData);
      }
      
      console.log('Template save response:', response);
      
      if (response && response.success) {
        toast.success(selectedTemplate ? 'Template updated' : 'Template created');
        closeEditor();
        
        // Call the success callback if provided
        if (onSaveSuccess) {
          await onSaveSuccess();
        }
        
        return true;
      } else {
        const errorMessage = `Failed to ${selectedTemplate ? 'update' : 'create'} template: ${response?.error || 'Unknown error'}`;
        setError(errorMessage);
        toast.error(errorMessage);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save template';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Template save error:', error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [templateFormData, selectedTemplate, closeEditor, onSaveSuccess, validateForm]);

  // Add a deleteTemplate function to complete the interface
  const deleteTemplate = useCallback(async (templateId: number) => {
    try {
      console.log(`Deleting template ${templateId}`);
      // Implement actual deletion logic here
      return true;
    } catch (error) {
      console.error("Error deleting template:", error);
      return false;
    }
  }, []);

  return {
    // State
    selectedTemplate,
    templateFormData,
    isSubmitting,
    error,
    validationErrors,
    
    // Functions
    updateFormData,
    openEditor,
    closeEditor,
    saveTemplate,
    createFolder,
    deleteTemplate
  };
}

export default useTemplateEditor;