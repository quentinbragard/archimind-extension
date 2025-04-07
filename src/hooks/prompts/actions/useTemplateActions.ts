// src/hooks/prompts/actions/useTemplateActions.ts
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Template } from '@/types/prompts/templates';
import { DIALOG_TYPES } from '@/core/dialogs/registry';
import { useTemplateMutations } from './useTemplateMutations';
import { useFolderMutations } from './useFolderMutations';
import { useQueryClient } from 'react-query';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { useDialogManager } from '@/components/dialogs/core/DialogContext';

/**
 * A completely redesigned template action hook with improved reliability
 * and cleaner content flow
 */
export function useTemplateActions() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { trackTemplateUsage, createTemplate: createTemplateMutation } = useTemplateMutations();
  const { createFolder: createFolderMutation } = useFolderMutations();
  const queryClient = useQueryClient();
  const dialogManager = useDialogManager();
  
  /**
   * Safely open a dialog with fallback mechanisms
   */
  const openDialog = useCallback((dialogType, dialogData = {}) => {
    try {
      // Try dialog manager from context first
      if (dialogManager && typeof dialogManager.openDialog === 'function') {
        console.log(`Opening ${dialogType} dialog via context`);
        dialogManager.openDialog(dialogType, dialogData);
        return true;
      }
      
      // Fall back to window.dialogManager
      if (window.dialogManager && typeof window.dialogManager.openDialog === 'function') {
        console.log(`Opening ${dialogType} dialog via window`);
        window.dialogManager.openDialog(dialogType, dialogData);
        return true;
      }
      
      // If both approaches fail, try with a delay
      console.log(`Dialog manager not fully initialized, retrying ${dialogType} dialog...`);
      setTimeout(() => {
        if (window.dialogManager && typeof window.dialogManager.openDialog === 'function') {
          window.dialogManager.openDialog(dialogType, dialogData);
          console.log(`Successfully opened ${dialogType} dialog after delay`);
        } else {
          console.error(`Failed to open ${dialogType} dialog: dialog manager not available`);
          toast.error('System not initialized properly. Please refresh the page.');
        }
      }, 150);
      
      return true;
    } catch (error) {
      console.error(`Error opening ${dialogType} dialog:`, error);
      toast.error('Failed to open dialog');
      return false;
    }
  }, [dialogManager]);
  
 /**
 * Insert template content directly into the ChatGPT textarea
 * with improved handling of special characters and formatting
 */
const insertContentIntoChat = useCallback((content: string) => {
  if (!content) {
    console.error('No content to insert');
    return false;
  }
  
  console.log(`Attempting to insert content (${content.length} chars)`);
  
  try {
    // Find the textarea
    const textarea = document.querySelector('#prompt-textarea');
    if (!textarea) {
      console.error('Could not find #prompt-textarea element');
      toast.error('Could not find input area');
      return false;
    }
    
    // Normalize content (preserve all characters including quotes)
    const normalizedContent = content.replace(/\r\n/g, '\n');
    console.log('Content normalized, preserving special characters');
    
    // ---- Method 1: Event-based insertion ----
    try {
      // Make sure textarea is in focus
      textarea.focus();
      
      // For regular textareas
      if (textarea instanceof HTMLTextAreaElement) {
        console.log('Using HTMLTextAreaElement approach');
        
        // Set the value directly (preserves quotes and other special chars)
        textarea.value = normalizedContent;
        
        // Trigger input event to notify React/ChatGPT of the change
        const inputEvent = new Event('input', { bubbles: true, cancelable: true });
        textarea.dispatchEvent(inputEvent);
        
        // Trigger a change event as well for good measure
        const changeEvent = new Event('change', { bubbles: true });
        textarea.dispatchEvent(changeEvent);
        
        // Position cursor at the end
        textarea.selectionStart = textarea.selectionEnd = normalizedContent.length;
        
        return true;
      }
      
      // For contenteditable divs
      if (textarea instanceof HTMLElement) {
        console.log('Using contenteditable approach');
        
        // Properly escape HTML entities to preserve special characters
        const escapeHTML = (str) => {
          return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
        };
        
        // Generate HTML paragraphs with proper escaping
        const paragraphs = normalizedContent.split('\n');
        const paragraphsHTML = paragraphs.map(p => 
          `<p>${escapeHTML(p) || '<br>'}</p>`
        ).join('');
        
        // Set content directly
        textarea.innerHTML = paragraphsHTML;
        
        // Trigger input event
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        
        // Set selection at the end
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(textarea);
        range.collapse(false);
        selection?.removeAllRanges();
        selection?.addRange(range);
        
        return true;
      }
    } catch (e) {
      console.warn('Method 1 failed:', e);
      // Continue to next method
    }
    
    // ---- Method 2: ClipboardAPI approach ----
    try {
      console.log('Trying modern Clipboard API approach');
      
      // Focus the textarea first
      textarea.focus();
      
      // Use the newer Clipboard API
      navigator.clipboard.writeText(normalizedContent)
        .then(() => {
          // Execute paste command
          document.execCommand('paste');
          console.log('Content pasted via Clipboard API');
        })
        .catch(err => {
          console.warn('Clipboard API failed:', err);
          throw err; // Continue to next method
        });
      
      return true;
    } catch (e) {
      console.warn('Method 2 failed:', e);
      // Continue to next method
    }
    
    // ---- Method 3: Data transfer/clipboard approach ----
    try {
      console.log('Trying clipboard data transfer approach');
      
      // Create a data transfer to simulate paste
      const dataTransfer = new DataTransfer();
      dataTransfer.setData('text/plain', normalizedContent);
      
      // Create and dispatch events
      const pasteEvent = new ClipboardEvent('paste', {
        clipboardData: dataTransfer,
        bubbles: true,
        cancelable: true
      });
      
      textarea.dispatchEvent(pasteEvent);
      
      // Check if the event was handled
      if (!pasteEvent.defaultPrevented) {
        throw new Error('Paste event not handled');
      }
      
      return true;
    } catch (e) {
      console.warn('Method 3 failed:', e);
      // Continue to next method
    }
    
    // ---- Method 4: Command insertion ----
    try {
      console.log('Trying document.execCommand approach');
      
      // Fallback to execCommand (though deprecated)
      textarea.focus();
      document.execCommand('insertText', false, normalizedContent);
      return true;
    } catch (e) {
      console.warn('Method 4 failed:', e);
    }
    
    console.error('All insertion methods failed');
    toast.error('Could not insert template content');
    return false;
  } catch (error) {
    console.error('Error inserting template content:', error);
    toast.error('Failed to apply template');
    return false;
  }
}, []);
  
/**
 * Handle template content after editing in the placeholder editor
 * with improved content processing and panel closing
 */
const handleTemplateComplete = useCallback((finalContent: string) => {
  console.log('Template editing completed, content length:', finalContent?.length);
  
  if (!finalContent) {
    console.error('No content received from template editor');
    toast.error('Template content is empty');
    return;
  }
  
  // Normalize the content to ensure consistent newlines
  // but preserve intentional double newlines for paragraph breaks
  const normalizedContent = finalContent
    .replace(/\r\n/g, '\n')  // Convert Windows newlines to Unix newlines
    .replace(/\n{3,}/g, '\n\n');  // Normalize excessive newlines (more than 2) to double newlines
  
  // Insert the content with a small delay to ensure dialog is fully closed
  setTimeout(() => {
    insertContentIntoChat(normalizedContent);
    
    // Dispatch an event to close the main button and panels
    document.dispatchEvent(new CustomEvent('jaydai:close-all-panels'));
  }, 50);
}, [insertContentIntoChat]);

// Also update the useTemplate function to make sure panels are closed when template is used
const useTemplate = useCallback((template: Template) => {
  // Validation
  if (!template) {
    toast.error('Invalid template data');
    return;
  }
  
  if (!template.content) {
    toast.error('Template has no content');
    return;
  }
  
  console.log(`Using template: ${template.title || 'Untitled'}`);
  setIsProcessing(true);
  
  try {
    // Open the placeholder editor dialog
    openDialog(DIALOG_TYPES.PLACEHOLDER_EDITOR, {
      content: template.content,
      title: template.title || 'Untitled Template',
      onComplete: handleTemplateComplete
    });
    
    // Track template usage (don't await)
    if (template.id) {
      trackTemplateUsage.mutate(template.id);
    }
    
    // Close all panels when template is used
    // Note: We're closing panels here even before template editing completes
    // because the template dialog will be visible instead
    document.dispatchEvent(new CustomEvent('jaydai:close-all-panels'));
  } catch (error) {
    console.error('Error using template:', error);
    toast.error('Failed to open template editor');
  } finally {
    setIsProcessing(false);
  }
}, [openDialog, handleTemplateComplete, trackTemplateUsage]);
  
  /**
   * Open template editor to create a new template
   */
  const createTemplate = useCallback((initialFolder?: any) => {
    const dialogData = {
      formData: {
        name: '',
        content: '',
        description: '',
        folder: initialFolder?.name || '',
        folder_id: initialFolder?.id || undefined
      },
      userFolders: queryClient.getQueryData(QUERY_KEYS.USER_FOLDERS) || [],
      onSave: async (templateData: any) => {
        try {
          const result = await createTemplateMutation.mutateAsync({
            title: templateData.name,
            content: templateData.content,
            description: templateData.description,
            folder_id: templateData.folder_id
          });
          
          if (result) {
            // Force refresh templates
            queryClient.invalidateQueries(QUERY_KEYS.USER_TEMPLATES);
            queryClient.invalidateQueries(QUERY_KEYS.UNORGANIZED_TEMPLATES);
            queryClient.invalidateQueries(QUERY_KEYS.USER_FOLDERS);
            
            return true; // Close dialog
          } else {
            toast.error('Failed to create template');
            return false; // Keep dialog open
          }
        } catch (error) {
          console.error('Error creating template:', error);
          toast.error('An unexpected error occurred');
          return false;
        }
      }
    };
    
    openDialog(DIALOG_TYPES.CREATE_TEMPLATE, dialogData);
  }, [openDialog, createTemplateMutation, queryClient]);
  
  /**
   * Create a folder and then open template creation
   */
  const createFolderAndTemplate = useCallback(() => {
    try {
      const folderDialogData = {
        onSaveFolder: async (folderData: { name: string; path: string; description: string }) => {
          try {
            const result = await createFolderMutation.mutateAsync(folderData);
            return { success: true, folder: result };
          } catch (error) {
            console.error('Error creating folder:', error);
            return { success: false, error: 'Failed to create folder' };
          }
        },
        onFolderCreated: (newFolder: any) => {
          // Force refresh folders query
          queryClient.invalidateQueries(QUERY_KEYS.USER_FOLDERS);
          
          // Open create template dialog with the new folder selected
          setTimeout(() => {
            createTemplate(newFolder);
          }, 100);
        }
      };
      
      openDialog(DIALOG_TYPES.CREATE_FOLDER, folderDialogData);
    } catch (error) {
      console.error('Error in folder/template creation flow:', error);
      toast.error('Failed to create folder');
    }
  }, [createTemplate, createFolderMutation, queryClient, openDialog]);
  
  /**
   * Open template editor to edit an existing template
   */
  const editTemplate = useCallback((template: Template) => {
    if (!template || !template.id) {
      toast.error('Invalid template');
      return;
    }
    
    const dialogData = {
      template,
      formData: {
        name: template.title || '',
        content: template.content || '',
        description: template.description || '',
        folder: template.folder || '',
        folder_id: template.folder_id
      },
      userFolders: queryClient.getQueryData(QUERY_KEYS.USER_FOLDERS) || []
      // The saving will be handled by the dialog's internal logic
    };
    
    openDialog(DIALOG_TYPES.EDIT_TEMPLATE, dialogData);
  }, [openDialog, queryClient]);
  
  return {
    isProcessing,
    useTemplate,
    createTemplate,
    createFolderAndTemplate,
    editTemplate
  };
}