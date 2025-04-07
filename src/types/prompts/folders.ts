// src/types/prompts/folders.ts
import { Template } from './templates';

/**
   * Template folder structure
   */
  export interface TemplateFolder {
    id: number;
    name: string;
    path?: string;
    description?: string;
    type: 'official' | 'organization' | 'user';
    templates: Template[];
    Folders?: TemplateFolder[];
    is_pinned?: boolean;
    created_at?: string;
    updated_at?: string;
  }