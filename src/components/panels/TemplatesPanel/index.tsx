// src/components/panels/TemplatesPanel/index.tsx
import React, { useCallback, memo, useMemo } from 'react';
import { FolderOpen, RefreshCw, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { getMessage } from '@/core/utils/i18n';
import BasePanel from '../BasePanel';
import { usePanelNavigation } from '@/core/contexts/PanelNavigationContext';

// Import hooks with the new structure
import { 
  usePinnedFolders, 
  useUserFolders, 
  useUnorganizedTemplates,
  useFolderMutations,
  useTemplateMutations,
  useTemplateActions
} from '@/hooks/prompts';

import { 
  FolderSection, 
  FolderList 
} from '@/components/folders';

import { TemplateItem } from '@/components/templates/TemplateItem';
import { DIALOG_TYPES } from '@/core/dialogs/registry';
import { LoadingState } from './LoadingState';
import { EmptyMessage } from './EmptyMessage';
import { Template, TemplateFolder } from '@/types/prompts/templates';

interface TemplatesPanelProps {
  showBackButton?: boolean;
  onBack?: () => void;
  onClose?: () => void;
}

/**
 * Panel for browsing and managing templates with optimized rendering
 */
const TemplatesPanel: React.FC<TemplatesPanelProps> = ({
  showBackButton,
  onBack,
  onClose
}) => {
  // Use Panel Navigation hook for moving between panels
  const { pushPanel } = usePanelNavigation();

  // Fetch data with React Query hooks
  const { 
    data: pinnedFolders = { official: [], organization: [] }, 
    isLoading: loadingPinned,
    error: pinnedError,
    refetch: refetchPinned
  } = usePinnedFolders();
  
  const { 
    data: userFolders = [], 
    isLoading: loadingUser,
    error: userError,
    refetch: refetchUser
  } = useUserFolders();

  const {
    data: unorganizedTemplates = [],
    isLoading: loadingUnorganized,
    error: unorganizedError,
    refetch: refetchUnorganized
  } = useUnorganizedTemplates();
  
  // Get mutations from the hooks
  const { toggleFolderPin, deleteFolder } = useFolderMutations();
  const { deleteTemplate } = useTemplateMutations();
  
  // Get template actions
  const { useTemplate, createTemplate, editTemplate, createFolderAndTemplate } = useTemplateActions();
  
  // Handle navigation to browse panels
  const handleBrowseOfficialTemplates = useCallback(() => {
    pushPanel({ 
      type: 'templatesBrowse',
      props: {
        folderType: 'official',
        pinnedFolderIds: pinnedFolders.official.map(folder => folder.id),
        onPinChange: async (folderId, isPinned) => {
          try {
            // Call the mutation
            await toggleFolderPin.mutateAsync({ 
              folderId, 
              isPinned, 
              type: 'official' 
            });
            
            // Trigger a refetch of pinned folders to update the UI
            await refetchPinned();
          } catch (error) {
            console.error('Error in pin change:', error);
            // Show error notification if needed
          }
        }
      }
    });
  }, [pushPanel, pinnedFolders.official, toggleFolderPin, refetchPinned]);
  
  const handleBrowseOrganizationTemplates = useCallback(() => {
    pushPanel({
      type: 'templatesBrowse',
      props: {
        folderType: 'organization',
        pinnedFolderIds: pinnedFolders.organization.map(folder => folder.id),
        onPinChange: async (folderId, isPinned) => {
          try {
            // Call the mutation
            await toggleFolderPin.mutateAsync({ 
              folderId, 
              isPinned, 
              type: 'organization' 
            });
            
            // Trigger a refetch of pinned folders to update the UI
            await refetchPinned();
          } catch (error) {
            console.error('Error in pin change:', error);
            // Show error notification if needed
          }
        }
      }
    });
  }, [pushPanel, pinnedFolders.organization, toggleFolderPin, refetchPinned]);
  
  // Memoize combined loading and error states to prevent unnecessary renders
  const { isLoading, hasError, errorMessage } = useMemo(() => ({
    isLoading: loadingPinned || loadingUser || loadingUnorganized,
    hasError: !!pinnedError || !!userError || !!unorganizedError,
    errorMessage: (pinnedError || userError || unorganizedError)?.message || 'Unknown error'
  }), [
    loadingPinned, loadingUser, loadingUnorganized,
    pinnedError, userError, unorganizedError
  ]);
  
  // Memoize isEmpty check to prevent recalculation on every render
  const isEmpty = useMemo(() => (
    (!pinnedFolders?.official?.length && 
     !pinnedFolders?.organization?.length && 
     !userFolders?.length &&
     !unorganizedTemplates?.length)
  ), [
    pinnedFolders?.official?.length,
    pinnedFolders?.organization?.length, 
    userFolders?.length,
    unorganizedTemplates?.length
  ]);

  // Handle refresh with loading state - memoized to prevent recreation on render
  const handleRefresh = useCallback(async () => {
    try {
      await Promise.all([
        refetchPinned(), 
        refetchUser(),
        refetchUnorganized()
      ]);
    } catch (error) {
      console.error('Failed to refresh templates:', error);
    }
  }, [refetchPinned, refetchUser, refetchUnorganized]);

  // Template delete handler - works for all templates
  const handleDeleteTemplate = useCallback((templateId: number) => {
    if (window.dialogManager) {
      window.dialogManager.openDialog(DIALOG_TYPES.CONFIRMATION, {
        title: getMessage('deleteTemplate', undefined, 'Delete Template'),
        description: getMessage('deleteTemplateConfirmation', undefined, 'Are you sure you want to delete this template? This action cannot be undone.'),
        onConfirm: async () => {
          try {
            await deleteTemplate.mutateAsync(templateId);
            // Refresh data after deletion
            await Promise.all([
              refetchUser(),
              refetchUnorganized()
            ]);
            return true;
          } catch (error) {
            console.error('Error deleting template:', error);
            return false;
          }
        }
      });
    }
  }, [deleteTemplate, refetchUser, refetchUnorganized]);

  // Folder delete handler
  const handleDeleteFolder = useCallback((folderId: number) => {
    if (window.dialogManager) {
      window.dialogManager.openDialog(DIALOG_TYPES.CONFIRMATION, {
        title: getMessage('deleteFolder', undefined, 'Delete Folder'),
        description: getMessage('deleteFolderConfirmation', undefined, 'Are you sure you want to delete this folder and all its templates? This action cannot be undone.'),
        onConfirm: async () => {
          try {
            await deleteFolder.mutateAsync(folderId);
            // Refresh user folders after deletion
            await refetchUser();
            return true;
          } catch (error) {
            console.error('Error deleting folder:', error);
            return false;
          }
        }
      });
    }
    return Promise.resolve(false);
  }, [deleteFolder, refetchUser]);

  // Template edit handler - works for all templates
  const handleEditTemplate = useCallback((template: Template) => {
    // Use the existing editTemplate function from templateActions
    editTemplate(template);
  }, [editTemplate]);

  // Error handling display
  if (hasError) {
    return (
      <BasePanel
        title={getMessage('templates', undefined, "Templates")}
        icon={FolderOpen}
        showBackButton={showBackButton}
        onBack={onBack}
        onClose={onClose}
      >
        <Alert variant="destructive">
          <AlertDescription>
            <div className="flex flex-col items-center justify-center py-4">
              <p className="mb-2">Failed to load templates: {errorMessage}</p>
              <Button 
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="mt-2"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </BasePanel>
    );
  }

  // Render loading state
  if (isLoading) {
    return (
      <BasePanel
        title={getMessage('templates', undefined, "Templates")}
        icon={FolderOpen}
        showBackButton={showBackButton}
        onBack={onBack}
        onClose={onClose}
        className="w-80"
      >
        <LoadingState />
      </BasePanel>
    );
  }

  // Render empty state
  if (isEmpty) {
    return (
      <BasePanel
        title={getMessage('templates', undefined, "Templates")}
        icon={FolderOpen}
        showBackButton={showBackButton}
        onBack={onBack}
        onClose={onClose}
        className="w-80"
      >
        <div className="py-8 px-4 text-center space-y-6">
          <FolderOpen className="h-8 w-8 text-muted-foreground mx-auto opacity-40" />
          
          <p className="text-sm text-muted-foreground">
            {getMessage('noTemplates', undefined, "You don’t have any templates yet.")}
          </p>
  
          {/* CTA: Create */}
          <div className="space-y-2">
            <Button 
              variant="default" 
              size="sm" 
              onClick={createFolderAndTemplate}
              className="w-full"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              {getMessage('createFirstTemplate', undefined, 'Create Your First Template')}
            </Button>
  
            {/* CTA: Browse Official Templates */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleBrowseOfficialTemplates}
              className="w-full"
            >
              <FolderOpen className="mr-2 h-4 w-4" />
              {getMessage('browseOfficialTemplates', undefined, 'Browse Official Templates')}
            </Button>
          </div>
  
          {/* Refresh */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRefresh}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {getMessage('refresh', undefined, 'Refresh')}
          </Button>
        </div>
      </BasePanel>
    );
  }
  

  // Main content render with templates and folders
  return (
    <BasePanel
      title={getMessage('templates', undefined, "Templates")}
      icon={FolderOpen}
      showBackButton={showBackButton}
      onBack={onBack}
      onClose={onClose}
      className="w-80"
    >
      <div className="space-y-4">
        {/* Official Templates Section */}
        {pinnedFolders?.official?.length > 0 ? (
          <>
            <FolderSection
              title={getMessage('officialTemplates', undefined, 'Official Templates')}
              iconType="official"
              showBrowseMore={true}
              onBrowseMore={handleBrowseOfficialTemplates}
            >
              <FolderList
                folders={pinnedFolders.official}
                type="official"
                onTogglePin={(folderId, isPinned) => 
                  toggleFolderPin.mutate({ folderId, isPinned, type: 'official' })
                }
                onUseTemplate={useTemplate}
                showPinControls={true}
                emptyMessage="No pinned official templates."
              />
            </FolderSection>
            <Separator />
          </>
        ) : (
          <FolderSection
          title={getMessage('officialTemplates', undefined, 'Official Templates')}
          iconType="official"
          showBrowseMore={true}
          onBrowseMore={handleBrowseOfficialTemplates}
        >
            <EmptyMessage>
              {getMessage('noPinnedOfficialTemplates', undefined, 'No pinned official templates.')}
            </EmptyMessage>
          </FolderSection>
        )}
        {/* Organization Templates Section */}
        <FolderSection
          title={getMessage('organizationTemplates', undefined, 'Organization Templates')}
          iconType="organization"
          isEmpty={!pinnedFolders?.organization?.length}
          showBrowseMore={false}
          onBrowseMore={handleBrowseOrganizationTemplates}
        >
          {pinnedFolders?.organization?.length > 0 ? (
            <FolderList
              folders={pinnedFolders.organization}
              type="organization"
              onTogglePin={(folderId, isPinned) => 
                toggleFolderPin.mutate({ folderId, isPinned, type: 'organization' })
              }
              onUseTemplate={useTemplate}
              showPinControls={true}
              emptyMessage="No pinned organization templates."
            />
          ) : (
            <EmptyMessage>
              {getMessage('noPinnedOrganizationTemplates', undefined, 'No pinned organization templates.')}
            </EmptyMessage>
          )}
        </FolderSection>
        <Separator />
        
        {/* User Templates Section - With edit/delete capabilities */}
        <FolderSection
          title={getMessage('myTemplates', undefined, 'My Templates')}
          iconType="user"
          onCreateTemplate={createTemplate}
          showCreateButton={true}
        >
          {userFolders?.length || unorganizedTemplates?.length ? (
            <>
              {/* Display user folders if any */}
              {userFolders?.length > 0 && (
                <FolderList
                  folders={userFolders}
                  type="user"
                  onDeleteFolder={handleDeleteFolder}
                  onEditTemplate={handleEditTemplate}
                  onDeleteTemplate={handleDeleteTemplate}
                  onUseTemplate={useTemplate}
                  showDeleteControls={true}
                  emptyMessage="No user templates. Create a template to get started."
                />
              )}
              
              {/* Display unorganized templates section if any */}
              {unorganizedTemplates?.length > 0 && (
                <div className="mt-4">
                  <div className="text-xs font-medium text-muted-foreground mb-1 px-2 flex items-center">
                    <FolderOpen className="h-3.5 w-3.5 mr-1 text-muted-foreground/70" />
                    {getMessage('unorganizedTemplates', undefined, 'Unorganized Templates')}
                  </div>
                  <div className="space-y-1 mt-2">
                    {unorganizedTemplates.map((template) => (
                      <TemplateItem
                        key={`template-${template.id}`}
                        template={template}
                        type="user"
                        onEditTemplate={handleEditTemplate}
                        onDeleteTemplate={handleDeleteTemplate}
                        onUseTemplate={useTemplate}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <EmptyMessage>
              {getMessage('noUserTemplates', undefined, 'No user templates. Create a template to get started.')}
            </EmptyMessage>
          )}
        </FolderSection>
      </div>
    </BasePanel>
  );
};

// Export with memo to prevent unnecessary re-renders
export default memo(TemplatesPanel);