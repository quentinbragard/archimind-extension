// src/components/panels/BrowseTemplatesPanel/index.tsx
import React, { useCallback, memo, useState, useEffect } from 'react';
import { FolderOpen } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import BasePanel from '../BasePanel';
import { 
  useFolderSearch,
  useAllFoldersOfType,
  useFolderMutations,
  useTemplateActions,
  usePinnedFolders
} from '@/hooks/prompts';
import {
  FolderList,
  FolderSearch
} from '@/components/folders';
import { LoadingState } from '@/components/panels/TemplatesPanel/LoadingState';
import { EmptyMessage } from '@/components/panels/TemplatesPanel/EmptyMessage';

interface BrowseTemplatesPanelProps {
  folderType: 'official' | 'organization';
  pinnedFolderIds?: number[];
  onPinChange?: (folderId: number, isPinned: boolean) => Promise<void>;
  onBackToTemplates: () => void;
  maxHeight?: string;
}

/**
 * Panel for browsing and pinning template folders
 * Updated to handle state updates correctly
 */
const BrowseTemplatesPanel: React.FC<BrowseTemplatesPanelProps> = ({
  folderType,
  pinnedFolderIds = [],
  onPinChange,
  onBackToTemplates,
  maxHeight = '75vh'
}) => {
  // Local state to track pinned folders (initialized with prop)
  const [localPinnedIds, setLocalPinnedIds] = useState<number[]>(pinnedFolderIds);
  
  // If the pinnedFolderIds prop changes, update our local state
  useEffect(() => {
    setLocalPinnedIds(pinnedFolderIds);
  }, [pinnedFolderIds]);
  
  // Fetch all folders of this type using React Query
  const {
    data: folders = [],
    isLoading,
    error,
    refetch: refetchFolders
  } = useAllFoldersOfType(folderType);
  
  // Get pinned folders query client for invalidation
  const { refetch: refetchPinnedFolders } = usePinnedFolders();
  
  // Use folder search hook for filtering
  const {
    searchQuery,
    setSearchQuery,
    filteredFolders,
    clearSearch
  } = useFolderSearch(folders);
  
  // Get folder mutations (instead of direct useToggleFolderPin)
  const { toggleFolderPin } = useFolderMutations();
  
  // Template actions
  const { useTemplate } = useTemplateActions();
  
  // Handle toggling pin status - memoized to prevent recreation on each render
  const handleTogglePin = useCallback(async (folderId: number, isPinned: boolean) => {
    // Update local state immediately for better UX
    if (isPinned) {
      // If currently pinned, remove from local pinned IDs
      setLocalPinnedIds(prev => prev.filter(id => id !== folderId));
    } else {
      // If not pinned, add to local pinned IDs
      setLocalPinnedIds(prev => [...prev, folderId]);
    }
    
    try {
      // Call the mutation to update the backend
      await toggleFolderPin.mutateAsync({ 
        folderId, 
        isPinned, 
        type: folderType 
      });
      
      // Call the onPinChange prop if provided (after successful backend update)
      if (onPinChange) {
        await onPinChange(folderId, isPinned);
      }
      
      // Invalidate the pinned folders query to ensure fresh data
      refetchPinnedFolders();
    } catch (error) {
      console.error('Error toggling pin:', error);
      // Revert local state on error
      if (isPinned) {
        setLocalPinnedIds(prev => [...prev, folderId]);
      } else {
        setLocalPinnedIds(prev => prev.filter(id => id !== folderId));
      }
    }
  }, [toggleFolderPin, folderType, onPinChange, refetchPinnedFolders]);

  // Add pinned status to folders using our local state
  const foldersWithPinStatus = React.useMemo(() => {
    if (!folders?.length) return [];
    
    return folders.map(folder => ({
      ...folder,
      is_pinned: localPinnedIds.includes(folder.id)
    }));
  }, [folders, localPinnedIds]);

  return (
    <BasePanel
      title={folderType === 'official' ? 'Official Templates' : 'Organization Templates'}
      icon={FolderOpen}
      showBackButton={true}
      onBack={onBackToTemplates}
      className="w-80"
      maxHeight={maxHeight}
    >
      {/* Search input */}
      <FolderSearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        placeholderText={`Search ${folderType} folders...`}
        onReset={clearSearch}
      />
      
      <Separator />
      
      {/* Content area with conditional rendering based on state */}
      <div className="overflow-y-auto">
        {isLoading ? (
          <LoadingState message={`Loading ${folderType} folders...`} />
        ) : error ? (
          <EmptyMessage>
            Error loading folders: {error instanceof Error ? error.message : 'Unknown error'}
          </EmptyMessage>
        ) : filteredFolders.length === 0 ? (
          <EmptyMessage>
            {searchQuery
              ? `No folders matching "${searchQuery}"`
              : `No ${folderType} folders available`}
          </EmptyMessage>
        ) : (
          <FolderList
            folders={foldersWithPinStatus}
            type={folderType}
            onTogglePin={handleTogglePin}
            onUseTemplate={useTemplate}
            showPinControls={true}
          />
        )}
      </div>
    </BasePanel>
  );
};

// Wrap with memo for performance optimization
export default memo(BrowseTemplatesPanel);