// src/components/panels/TemplatesPanel/utils/folderUtils.ts

import { TemplateFolder } from '@/types/prompts/templates';

/**
 * Count all templates in a folder including its subfolders
 */
export function countTemplatesInFolder(folder: TemplateFolder): number {
  if (!folder) return 0;
  
  let count = folder.templates?.length || 0;
  
  // Add templates from subfolders
  if (folder.Folders && folder.Folders.length > 0) {
    folder.Folders.forEach(subfolder => {
      count += countTemplatesInFolder(subfolder);
    });
  }
  
  return count;
}

/**
 * Find a folder by its ID in a folder tree
 */
export function findFolderById(folders: TemplateFolder[], id: number): TemplateFolder | null {
  for (const folder of folders) {
    if (folder.id === id) {
      return folder;
    }
    
    if (folder.Folders && folder.Folders.length > 0) {
      const subfolder = findFolderById(folder.Folders, id);
      if (subfolder) {
        return subfolder;
      }
    }
  }
  
  return null;
}

/**
 * Get the full path of a folder
 */
export function getFolderPath(folder: TemplateFolder): string {
  return folder.path || folder.name || '';
}

/**
 * Check if a folder is empty (no templates and no subfolders)
 */
export function isFolderEmpty(folder: TemplateFolder): boolean {
  return (!folder.templates || folder.templates.length === 0) && 
         (!folder.Folders || folder.Folders.length === 0);
}

/**
 * Get folder tree depth for indentation
 */
export function getFolderDepth(folderPath: string): number {
  if (!folderPath) return 0;
  return folderPath.split('/').length;
}

/**
 * Compare folders by name for sorting
 */
export function compareFoldersByName(a: TemplateFolder, b: TemplateFolder): number {
  return (a.name || '').localeCompare(b.name || '');
}

/**
 * Group folders by type (official, organization, user)
 */
export function groupFoldersByType(folders: TemplateFolder[]): {
  official: TemplateFolder[];
  organization: TemplateFolder[];
  user: TemplateFolder[];
} {
  return folders.reduce(
    (acc, folder) => {
      const type = folder.type as 'official' | 'organization' | 'user';
      if (type && acc[type]) {
        acc[type].push(folder);
      }
      return acc;
    },
    { official: [], organization: [], user: [] } as {
      official: TemplateFolder[];
      organization: TemplateFolder[];
      user: TemplateFolder[];
    }
  );
}