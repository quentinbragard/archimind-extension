// src/components/templates/DeleteButton.tsx
import React, { useState } from 'react';
import { Trash, MoreVertical, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getMessage } from '@/core/utils/i18n';

interface DeleteButtonProps {
  onDelete: () => Promise<void | boolean> | void;
  itemType: 'folder' | 'template';
  showIcon?: boolean;
  stopPropagation?: boolean;
  className?: string;
  disabled?: boolean;
}

/**
 * Reusable delete button component with confirmation dialog
 */
export function DeleteButton({
  onDelete,
  itemType,
  showIcon = false,
  stopPropagation = false,
  className = '',
  disabled = false
}: DeleteButtonProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle opening delete dialog
  const handleOpenDeleteDialog = (e: React.MouseEvent) => {
    if (stopPropagation) {
      e.stopPropagation();
    }
    setIsDeleteDialogOpen(true);
  };

  // Handle actual delete operation
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error(`Error deleting ${itemType}:`, error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* Use dropdown for delete when not showing direct icon */}
      {!showIcon ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => stopPropagation && e.stopPropagation()}>
            <Button
              variant="ghost"
              size="sm"
              disabled={disabled}
              className={`h-6 w-6 p-0 flex-shrink-0 text-muted-foreground opacity-70 hover:opacity-100 ${className}`}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              onClick={handleOpenDeleteDialog} 
              className="text-destructive cursor-pointer"
            >
              <Trash className="h-4 w-4 mr-2" />
              {getMessage('deleteItem', [itemType === 'folder' ? getMessage('folder', undefined, 'Folder') : getMessage('template', undefined, 'Template')], `Delete ${itemType === 'folder' ? 'Folder' : 'Template'}`)}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        // Show direct delete button if showIcon is true
        <Button 
          variant="ghost" 
          size="sm" 
          className={`h-6 w-6 p-0 text-destructive ${className}`}
          onClick={handleOpenDeleteDialog}
          disabled={disabled}
        >
          <Trash className="h-3.5 w-3.5" />
        </Button>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {getMessage('deleteConfirmTitle', [itemType === 'folder' ? getMessage('folder', undefined, 'Folder') : getMessage('template', undefined, 'Template')], `Delete ${itemType === 'folder' ? 'Folder' : 'Template'}`)}
            </DialogTitle>
            <DialogDescription>
              {getMessage('deleteConfirmMessageNoName', [itemType === 'folder' ? getMessage('folder', undefined, 'folder') : getMessage('template', undefined, 'template')], `This will permanently delete this ${itemType}.`)}
              {itemType === 'folder' && (
                <div className="mt-2 text-amber-600 dark:text-amber-400 flex items-start">
                  <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{getMessage('deleteFolderWarning', undefined, 'All templates inside this folder will also be deleted.')}</span>
                </div>
              )}
              <div className="mt-2 text-amber-600 dark:text-amber-400 flex items-start">
                <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>{getMessage('deleteActionWarning', undefined, 'This action cannot be undone.')}</span>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              {getMessage('cancel', undefined, 'Cancel')}
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? getMessage('deleting', undefined, 'Deleting...') : getMessage('delete', undefined, 'Delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}