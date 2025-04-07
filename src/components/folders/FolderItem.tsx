// src/components/folders/FolderItem.tsx
import React, { useState, memo, useCallback, useRef } from 'react';
import { Template, TemplateFolder } from '@/types/prompts/templates';
import { FolderHeader } from './FolderHeader';
import { TemplateItem } from '@/components/templates/TemplateItem';
import { PinButton } from './PinButton';
import { ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Number of items to display per page
const ITEMS_PER_PAGE = 5;

interface FolderItemProps {
  folder: TemplateFolder;
  type: 'official' | 'organization' | 'user';
  onTogglePin?: (folderId: number, isPinned: boolean) => Promise<void> | void;
  onDeleteFolder?: (folderId: number) => Promise<boolean> | void;
  onUseTemplate?: (template: Template) => void;
  onEditTemplate?: (template: Template) => void; // Optional prop for template editing
  onDeleteTemplate?: (templateId: number) => Promise<boolean> | void; // Optional prop for template deletion
  showPinControls?: boolean;
  showDeleteControls?: boolean;
  level?: number;
  initialExpanded?: boolean;
}

/**
 * Component for rendering a single folder with its templates and subfolders
 */
const FolderItem: React.FC<FolderItemProps> = ({
  folder,
  type,
  onTogglePin,
  onDeleteFolder,
  onUseTemplate,
  onEditTemplate, // Received from props
  onDeleteTemplate, // Received from props
  showPinControls = false,
  showDeleteControls = false,
  level = 0,
  initialExpanded = false
}) => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  // Maintain local state for isPinned to update UI immediately
  const [isPinned, setIsPinned] = useState(!!folder.is_pinned);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  // Add a ref to track if a pin operation is in progress
  const isPinOperationInProgress = useRef(false);
  
  // Skip rendering if folder is invalid
  if (!folder || !folder.id || !folder.name) {
    return null;
  }
  
  // Prevent infinite recursion by limiting depth
  if (level > 5) {
    return null;
  }
  
  // Ensure folder.templates is an array
  const allTemplates = Array.isArray(folder.templates) ? folder.templates : [];
  const templates = allTemplates.filter(template => template.folder_id !== null);
  
  // Ensure folder.Folders is an array
  const subfolders = Array.isArray(folder.Folders) ? folder.Folders : [];
  
  // Combine templates and subfolders into a single array for pagination
  const allItems = [
    ...templates.map(template => ({ type: 'template', data: template })),
    ...subfolders.map(subfolder => ({ type: 'folder', data: subfolder }))
  ];
  
  // Calculate total pages and current items
  const totalPages = Math.ceil(allItems.length / ITEMS_PER_PAGE);
  const startIdx = currentPage * ITEMS_PER_PAGE;
  const endIdx = Math.min(startIdx + ITEMS_PER_PAGE, allItems.length);
  const currentItems = allItems.slice(startIdx, endIdx);
  
  const hasMoreItems = allItems.length > ITEMS_PER_PAGE;
  
  // Navigation handlers
  const goToPrevPage = useCallback(() => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  }, []);
  
  const goToNextPage = useCallback(() => {
    setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
  }, [totalPages]);
  
  // When folder is collapsed, reset pagination
  const toggleExpansion = useCallback(() => {
    if (isExpanded) {
      // Reset to first page when closing
      setCurrentPage(0);
    }
    setIsExpanded(prev => !prev);
  }, [isExpanded]);
  
  // Handle pin toggle with debounce to prevent multiple calls
  const handleTogglePin = useCallback((e: React.MouseEvent) => {
    if (onTogglePin && !isPinOperationInProgress.current) {
      e.stopPropagation();
      
      // Set flag to prevent duplicate calls
      isPinOperationInProgress.current = true;
      
      // Optimistically update the UI
      setIsPinned(prevPinned => !prevPinned);
      
      // Call the actual toggle function
      Promise.resolve(onTogglePin(folder.id, isPinned))
        .catch(err => {
          // Revert UI state if the operation fails
          console.error('Pin operation failed:', err);
          setIsPinned(isPinned); // Revert to original state
        })
        .finally(() => {
          // Reset the operation flag after a delay
          setTimeout(() => {
            isPinOperationInProgress.current = false;
          }, 1000);
        });
    }
  }, [folder.id, isPinned, onTogglePin]);
  
  // Handle folder deletion
  const handleDeleteFolder = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteFolder) {
      onDeleteFolder(folder.id);
    }
  }, [folder.id, onDeleteFolder]);
  
  // Create action buttons for folder header
  const actionButtons = (
    <div className="flex items-center gap-1.5">
      {/* Pin button for official and organization folders */}
      {showPinControls && onTogglePin && (type === 'official' || type === 'organization') && (
        <PinButton 
          isPinned={isPinned} 
          onClick={handleTogglePin} 
          disabled={isPinOperationInProgress.current}
          className="" 
        />
      )}
      
      {/* Action buttons for user folders - only visible on hover */}
      {type === 'user' && (
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Delete button for user folders - with red accent */}
          {showDeleteControls && onDeleteFolder && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30"
                    onClick={handleDeleteFolder}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Delete folder</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="folder-container mb-1 group">
      {/* Folder header */}
      <FolderHeader
        folder={folder}
        isExpanded={isExpanded}
        onToggle={toggleExpansion}
        actionButtons={actionButtons}
      />
      
      {/* Expanded content (templates and subfolders) */}
      {isExpanded && (
        <div className="folder-content pl-6 mt-1">
          {/* Render current page of items */}
          {currentItems.map((item, index) => {
            if (item.type === 'template') {
              const template = item.data as Template;
              return (
                <TemplateItem
                  key={`template-${template.id}`}
                  template={template}
                  type={type}
                  onUseTemplate={onUseTemplate ? () => onUseTemplate(template) : undefined}
                  // Only pass the edit function if it exists
                  onEditTemplate={onEditTemplate ? () => onEditTemplate(template) : undefined}
                  // Only pass the delete function if it exists and template has an id
                  onDeleteTemplate={template.id && onDeleteTemplate ? 
                    () => onDeleteTemplate(template.id as number) : undefined
                  }
                />
              );
            } else {
              const subfolder = item.data as TemplateFolder;
              return (
                <FolderItem
                  key={`subfolder-${subfolder.id}-${type}`}
                  folder={subfolder}
                  type={type}
                  onTogglePin={onTogglePin}
                  onDeleteFolder={onDeleteFolder}
                  onUseTemplate={onUseTemplate}
                  // Pass through the edit and delete handlers, but only if they exist
                  onEditTemplate={onEditTemplate}
                  onDeleteTemplate={onDeleteTemplate}
                  showPinControls={showPinControls}
                  showDeleteControls={showDeleteControls}
                  level={level + 1}
                />
              );
            }
          })}
          
          {/* Pagination controls */}
          {hasMoreItems && (
            <div className="flex justify-end mt-2 pr-1">
              <div className="flex items-center space-x-1 bg-background/80 border border-border/30 rounded px-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 p-0"
                  onClick={goToPrevPage}
                  disabled={currentPage === 0}
                  title="Previous items"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs text-muted-foreground px-1">
                  {currentPage + 1}/{totalPages}
                </span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 p-0"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages - 1}
                  title="Next items"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(FolderItem);

// Also export a named export for compatibility
export { FolderItem };