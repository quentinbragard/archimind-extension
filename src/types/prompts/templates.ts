// src/types/prompts/templates.ts

/**
 * Template interface
 */
export interface Template {
    id: number;
    title: string;
    content: string;
    description?: string;
    folder_id?: number | null;
    user_id?: number;
    folder?: string;
    created_at?: string;
    updated_at?: string;
    last_used_at?: string;
    usage_count?: number;
    tags?: string[];
    type?: 'official' | 'organization' | 'user';
    language?: string;
    based_on_official_id?: number | null;
  }
  
  /**
   * Template folder interface
   */
  export interface TemplateFolder {
    id: number;
    name: string;
    path?: string;
    description?: string;
    templates?: Template[];
    Folders?: TemplateFolder[];
    parent_id?: number | null;
    type?: 'official' | 'organization' | 'user';
    is_pinned?: boolean;
  }
  
  /**
   * Template placeholder for dynamic content
   */
  export interface Placeholder {
    key: string;
    value: string;
  }
  
  /**
   * Default form data for template creation/editing
   */
  export const DEFAULT_FORM_DATA = {
    name: '',
    content: '',
    description: '',
    folder: '',
    folder_id: undefined,
    based_on_official_id: null
  };
  
  /**
   * Dialog types registry - needed for certain Dialog operations
   */
  export const DIALOG_TYPES = {
    CREATE_TEMPLATE: 'createTemplate',
    EDIT_TEMPLATE: 'editTemplate',
    CREATE_FOLDER: 'createFolder',
    SETTINGS: 'settings',
    AUTH: 'auth',
    PLACEHOLDER_EDITOR: 'placeholderEditor',
    CONFIRMATION: 'confirmation'
  };