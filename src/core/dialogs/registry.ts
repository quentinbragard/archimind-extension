// src/core/dialogs/registry.ts

// Define dialog types
export const DIALOG_TYPES = {
  // Existing dialog types
  SETTINGS: 'settings',
  CREATE_TEMPLATE: 'createTemplate',
  EDIT_TEMPLATE: 'editTemplate',
  CREATE_FOLDER: 'createFolder',
  AUTH: 'auth',
  PLACEHOLDER_EDITOR: 'placeholderEditor',
  CONFIRMATION: 'confirmation',
  
  // New dialog type for enhanced stats
  ENHANCED_STATS: 'enhancedStats'
} as const;

// Export the dialog types
export type DialogType = typeof DIALOG_TYPES[keyof typeof DIALOG_TYPES];

// Define dialog props for each dialog type
export interface DialogProps {
  [DIALOG_TYPES.SETTINGS]: {};
  [DIALOG_TYPES.CREATE_TEMPLATE]: {
    formData?: any;
    onFormChange?: (formData: any) => void;
    onSave?: (formData: any) => Promise<boolean>;
    userFolders?: any[];
    selectedFolder?: any;
  };
  [DIALOG_TYPES.EDIT_TEMPLATE]: {
    template: any;
    formData?: any;
    onFormChange?: (formData: any) => void;
    onSave?: (formData: any) => Promise<boolean>;
    userFolders?: any[];
  };
  [DIALOG_TYPES.CREATE_FOLDER]: {
    onSaveFolder?: (folderData: any) => Promise<any>;
    onFolderCreated?: (folder: any) => void;
  };
  [DIALOG_TYPES.AUTH]: {
    initialMode?: 'signin' | 'signup';
    isSessionExpired?: boolean;
    onSuccess?: () => void;
  };
  [DIALOG_TYPES.PLACEHOLDER_EDITOR]: {
    content: string;
    title?: string;
    onComplete: (content: string) => void;
  };
  [DIALOG_TYPES.CONFIRMATION]: {
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  };
  // Props for enhanced stats dialog (none needed as it uses the stats service)
  [DIALOG_TYPES.ENHANCED_STATS]: {};
}