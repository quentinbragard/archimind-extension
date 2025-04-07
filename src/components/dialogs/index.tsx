// src/components/dialogs/index.tsx
import React, { useEffect } from 'react';
import { DialogManagerProvider } from './core/DialogContext';
import { TemplateDialog } from './templates/TemplateDialog';
import { FolderDialog } from './templates/FolderDialog';
import { PlaceholderEditor } from './templates/PlaceHolderEditor';
import { AuthDialog } from './auth/AuthDialog';
import { SettingsDialog } from './settings/SettingsDialog';
import { ConfirmationDialog } from './common/ConfirmationDialog';
import { EnhancedStatsDialog } from './analytics/EnhancedStatsDialog';

// Create a global dialog manager initialization flag
let initializationAttempted = false;

/**
 * Main dialog provider that includes all dialog components
 * This component ensures window.dialogManager is available
 */
export const DialogProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // Debug check to verify dialog manager initialization
  useEffect(() => {
    console.log('DialogProvider mounted, checking dialogManager availability');
    
    // Attempt to initialize dialog manager if it doesn't exist
    if (!window.dialogManager) {
      console.warn('Dialog manager not found, will try to initialize from DialogProvider');
      initializationAttempted = true;
      
      // Create a temporary placeholder until the real one is initialized
      window.dialogManager = {
        openDialog: (type, data) => {
          console.warn(`Attempted to open dialog ${type} before initialization is complete.`);
          // Queue this operation for after initialization
          setTimeout(() => {
            if (window.dialogManager?.isInitialized) {
              console.log(`Executing queued dialog open for ${type}`);
              window.dialogManager.openDialog(type, data);
            } else {
              console.error(`Failed to open dialog ${type}: dialog manager still not initialized.`);
            }
          }, 100);
        },
        closeDialog: (type) => {
          console.warn(`Attempted to close dialog ${type} before initialization is complete.`);
        },
        isInitialized: false
      };
    } else {
      console.log('window.dialogManager already available:', window.dialogManager);
    }
    
    // Monitor for any errors in dialog functionality
    const handleError = (error: ErrorEvent) => {
      if (error.message.includes('dialogManager') || error.message.includes('Dialog')) {
        console.error('Dialog system error detected:', error);
      }
    };
    
    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);
  
  return (
    <DialogManagerProvider>
      {children}
      
      {/* Register all dialogs here */}
      <TemplateDialog />
      <FolderDialog />
      <PlaceholderEditor />
      <AuthDialog />
      <SettingsDialog />
      <ConfirmationDialog />
      <EnhancedStatsDialog />
    </DialogManagerProvider>
  );
};

// Export individual components and hooks
export { DialogManagerProvider } from './core/DialogContext';
export { useDialog, useDialogManager, useOpenDialog } from './core/DialogContext';
export { TemplateDialog } from './templates/TemplateDialog';
export { FolderDialog } from './templates/FolderDialog';
export { PlaceholderEditor } from './templates/PlaceHolderEditor';
export { AuthDialog } from './auth/AuthDialog';
export { SettingsDialog } from './settings/SettingsDialog';
export { ConfirmationDialog } from './common/ConfirmationDialog';
export { EnhancedStatsDialog } from './analytics/EnhancedStatsDialog';