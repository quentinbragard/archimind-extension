// src/components/dialogs/templates/TemplateDialog.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDialog } from '@/components/dialogs/core/DialogContext';
import { DIALOG_TYPES } from '@/core/dialogs/registry';
import { FolderPlus } from 'lucide-react';
import { DEFAULT_FORM_DATA } from '@/types/prompts/templates';
import { toast } from 'sonner';
import { promptApi } from '@/services/api';
import { getMessage } from '@/core/utils/i18n';

/**
 * Unified Template Dialog for both creating and editing templates
 * This version doesn't directly import React Query hooks to avoid errors
 */
export const TemplateDialog: React.FC = () => {
  // Get create and edit dialog states
  const createDialog = useDialog(DIALOG_TYPES.CREATE_TEMPLATE);
  const editDialog = useDialog(DIALOG_TYPES.EDIT_TEMPLATE);
  
  // Determine if either dialog is open
  const isOpen = createDialog.isOpen || editDialog.isOpen;
  
  // Get the appropriate data based on which dialog is open
  const data = createDialog.isOpen ? createDialog.data : editDialog.data;
  
  // Local state for form data 
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [userFoldersList, setUserFoldersList] = useState<any[]>([]);
  
  // Extract data from dialog
  const currentTemplate = data?.template || null;
  const initialFormData = data?.formData || DEFAULT_FORM_DATA;
  const onFormChange = data?.onFormChange;
  const onSave = data?.onSave
  const userFolders = data?.userFolders || [];
  const selectedFolder = data?.selectedFolder; // New: pre-selected folder from folder creation
  
  // Process user folders for the select dropdown
  const processUserFolders = useCallback(() => {
    // Safely validate and transform user folders
    if (!userFolders || !Array.isArray(userFolders)) {
      console.log('No valid user folders found');
      setUserFoldersList([]);
      return;
    }
    
    // Helper function to flatten folder hierarchy
    const flattenFolderHierarchy = (
      folders: any[], 
      path: string = "", 
      result: {id: number, name: string, fullPath: string}[] = []
    ) => {
      folders.forEach(folder => {
        // Extra validation to ensure folder is valid
        if (!folder || typeof folder.id !== 'number' || !folder.name) {
          console.warn('Invalid folder encountered:', folder);
          return;
        }
        
        const folderPath = path ? `${path} / ${folder.name}` : folder.name;
        
        result.push({
          id: folder.id,
          name: folder.name,
          fullPath: folderPath
        });
        
        // Recursively process subfolders if they exist
        if (folder.Folders && Array.isArray(folder.Folders) && folder.Folders.length > 0) {
          flattenFolderHierarchy(folder.Folders, folderPath, result);
        }
      });
    
      return result;
    };
    
    const flattenedFolders = flattenFolderHierarchy(userFolders);
    console.log('Processed user folders:', flattenedFolders);
    setUserFoldersList(flattenedFolders || []);
  }, [userFolders]);
  
  // Initialize form state when dialog opens or data changes
  useEffect(() => {
    if (isOpen) {
      // Reset validation errors
      setValidationErrors({});
  
      // Initialize form data only once when dialog opens
      console.log('Setting initial form data:', initialFormData);
      setFormData(initialFormData);
      
      // Set selected folder ID from form data if available
      if (initialFormData.folder_id) {
        setSelectedFolderId(initialFormData.folder_id.toString());
      } else {
        setSelectedFolderId('');
      }
      
      // Process user folders
      processUserFolders();
      
      // If there's a pre-selected folder, update the form accordingly
      if (selectedFolder) {
        console.log('Auto-selecting folder from creation:', selectedFolder);
        setSelectedFolderId(selectedFolder.id.toString());
        handleFormChange('folder_id', selectedFolder.id);
        handleFormChange('folder', selectedFolder.name);
      }
    }
    // Run this effect when dialog open state changes or when user folders update
  }, [isOpen, userFolders, selectedFolder, initialFormData, processUserFolders]);
  
  // Handle dialog close
  const handleClose = () => {
    if (createDialog.isOpen) {
      createDialog.close();
    } else {
      editDialog.close();
    }
    
    // Reset form state
    setFormData(DEFAULT_FORM_DATA);
    setSelectedFolderId('');
    setValidationErrors({});
  };
  
  // Form field change handler with validation
  const handleFormChange = (field: string, value: any) => {
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[field];
        return newErrors;
      });
    }
    
    // Update local state first
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      
      // Call the external change handler if provided
      if (onFormChange) {
        console.log(`Updating form field ${field}:`, value);
        onFormChange(newData);
      }
      
      return newData;
    });
  };
  
  // Handle folder selection
  const handleFolderSelect = (folderId: string) => {
    if (folderId === 'new') {
      // Open create folder dialog and pass callback to handle newly created folder
      if (window.dialogManager) {
        window.dialogManager.openDialog(DIALOG_TYPES.CREATE_FOLDER, {
          onSaveFolder: async (folderData: { name: string; path: string; description: string }) => {
            try {
              // Direct API call fallback
              const response = await promptApi.createFolder(folderData);
              
              if (response.success && response.folder) {
                return { success: true, folder: response.folder };
              } else {
                toast.error(response.error || getMessage('failedToCreateFolder'));
                return { success: false, error: response.error || getMessage('unknownError') };
              }
            } catch (error) {
              console.error('Error creating folder:', error);
              return { success: false, error: getMessage('failedToCreateFolder') };
            }
          },
          onFolderCreated: (folder: any) => {
            // When folder is created, update the form with the new folder
            console.log('New folder created, updating selection:', folder);
            setSelectedFolderId(folder.id.toString());
            handleFormChange('folder_id', folder.id);
            handleFormChange('folder', folder.name);
            
            // Add the new folder to the list immediately for better UX
            setUserFoldersList(prev => {
              // Check if folder is already in the list
              if (prev.some(f => f.id === folder.id)) {
                return prev;
              }
              
              // Add the new folder to the list
              return [...prev, {
                id: folder.id,
                name: folder.name,
                fullPath: folder.name
              }];
            });
          }
        });
      }
      return;
    }
    
    setSelectedFolderId(folderId);
    
    // Handle "root" folder (no folder) specially
    if (folderId === 'root') {
      handleFormChange('folder_id', undefined);
      handleFormChange('folder', '');
      return;
    }
    
    // Update form data with folder_id (as a number)
    handleFormChange('folder_id', parseInt(folderId, 10));
    
    // Find the selected folder's path for display
    const selectedFolder = userFoldersList.find(f => f.id.toString() === folderId);
    if (selectedFolder) {
      handleFormChange('folder', selectedFolder.fullPath);
    }
  };
  
  // Function to truncate folder name with ellipsis
  const truncateFolderPath = (path: string, maxLength: number = 35) => {
    if (!path || path.length <= maxLength) return path;
    
    // For paths with slashes, try to preserve the last part
    if (path.includes('/')) {
      const parts = path.split('/');
      const lastPart = parts[parts.length - 1].trim();
      const firstParts = parts.slice(0, -1).join('/');
      
      // If the last part is already too long, truncate it
      if (lastPart.length >= maxLength - 3) {
        return lastPart.substring(0, maxLength - 3) + '...';
      }
      
      // Otherwise, try to keep the last part intact and truncate the beginning
      const availableLength = maxLength - lastPart.length - 3 - 3; // 3 for ellipsis, 3 for " / "
      if (availableLength > 5) { // Only if we can show a meaningful portion
        return '...' + firstParts.substring(firstParts.length - availableLength) + ' / ' + lastPart;
      }
    }
    
    // Simple truncation for other cases
    return path.substring(0, maxLength - 3) + '...';
  };
  
  // Validate form before saving
  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.name?.trim()) {
      errors.name = getMessage('templateNameRequired');
    }
    
    if (!formData.content?.trim()) {
      errors.content = getMessage('templateContentRequired');
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Save template
  const handleSave = async () => {
    // Validate form
    if (!validateForm()) {
      // Show toast for validation errors
      if (validationErrors.name) {
        toast.error(validationErrors.name);
      } else if (validationErrors.content) {
        toast.error(validationErrors.content);
      }
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Saving template with data:', formData);
      
      // If onSave is provided (custom handling), use it
      if (onSave) {
        const success = await onSave(formData);
        if (success) {
          handleClose();
          return success;
        }
      } else {
        // Otherwise use direct API calls
        const templateData = {
          title: formData.name,
          content: formData.content,
          description: formData.description,
          folder_id: formData.folder_id
        };
        
        let response;
        if (currentTemplate?.id) {
          // Update existing template
          response = await promptApi.updateTemplate(currentTemplate.id, templateData);
        } else {
          // Create new template
          response = await promptApi.createTemplate(templateData);
        }
        
        if (response.success) {
          // Show success message
          toast.success(currentTemplate ? getMessage('templateUpdated') : getMessage('templateCreated'));
          
          // Set a short timeout to allow the toast to be visible before refresh
          if (currentTemplate) {
            setTimeout(() => {
              // Refresh the page to get updated data
              window.location.reload();
            }, 1000); // 1-second delay so user can see the success message
          }
          
          // Close the dialog
          handleClose();
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error(getMessage('errorSavingTemplate'));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {currentTemplate ? getMessage('editTemplate') : getMessage('createNewTemplate')}
          </DialogTitle>
          <DialogDescription>
            {currentTemplate 
              ? getMessage('editTemplateDescription')
              : getMessage('createTemplateDescription')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div>
            <label className="text-sm font-medium">{getMessage('templateName')}</label>
            <Input 
              value={formData.name || ''} 
              onChange={(e) => handleFormChange('name', e.target.value)}
              placeholder={getMessage('enterTemplateName')}
              className={`mt-1 ${validationErrors.name ? 'border-red-500' : ''}`}
            />
            {validationErrors.name && (
              <p className="text-xs text-red-500 mt-1">{validationErrors.name}</p>
            )}
          </div>
          
          <div>
            <label className="text-sm font-medium">{getMessage('description')}</label>
            <Input 
              value={formData.description || ''} 
              onChange={(e) => handleFormChange('description', e.target.value)}
              placeholder={getMessage('templateDescriptionPlaceholder')}
              className="mt-1"
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium">{getMessage('folder')}</label>
            </div>
            
            <Select 
              value={selectedFolderId || 'root'} 
              onValueChange={handleFolderSelect}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={getMessage('selectFolder')}>
                  {selectedFolderId === 'root' ? (
                    <span className="text-muted-foreground">{getMessage('noFolder')}</span>
                  ) : selectedFolderId ? (
                    <span className="truncate" title={formData.folder}>
                      {truncateFolderPath(formData.folder)}
                    </span>
                  ) : null}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="max-h-80">
                <SelectItem value="root">
                  <span className="text-muted-foreground">{getMessage('noFolder')}</span>
                </SelectItem>
                
                {userFoldersList.map(folder => (
                  <SelectItem 
                    key={folder.id} 
                    value={folder.id.toString()}
                    className="truncate"
                    title={folder.fullPath} // Show full path on hover
                  >
                    {folder.fullPath}
                  </SelectItem>
                ))}
                
                {/* Option to create a new folder */}
                <SelectItem value="new" className="text-primary font-medium">
                  <div className="flex items-center">
                    <FolderPlus className="h-4 w-4 mr-2" />
                    {getMessage('createNewFolder')}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium">{getMessage('content')}</label>
            <textarea 
              className={`flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm mt-1 ${
                validationErrors.content ? 'border-red-500' : ''
              }`}
              rows={6}
              value={formData.content || ''} 
              onChange={(e) => handleFormChange('content', e.target.value)}
              placeholder={getMessage('enterTemplateContent')}
            />
            {validationErrors.content && (
              <p className="text-xs text-red-500 mt-1">{validationErrors.content}</p>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            {getMessage('cancel')}
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 border-2 border-current border-t-transparent animate-spin rounded-full inline-block mr-2"></div>
                {currentTemplate ? getMessage('updating') : getMessage('creating')}
              </>
            ) : (
              currentTemplate ? getMessage('update') : getMessage('create')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};