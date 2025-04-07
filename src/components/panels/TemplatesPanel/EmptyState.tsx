// src/components/panels/TemplatesPanel/components/EmptyState.tsx

import React from 'react';
import { FileText, PlusCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMessage } from '@/core/utils/i18n';

interface EmptyStateProps {
  onCreateTemplate: () => void;
  onRefresh: () => void;
  refreshing?: boolean;
}

/**
 * Reusable empty state component for when no templates are available
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  onCreateTemplate,
  onRefresh,
  refreshing = false
}) => {
  return (
    <div className="py-8 px-4 text-center">
      <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-40" />
      <p className="text-sm text-muted-foreground">
        {getMessage('noTemplates', undefined, "No templates available")}
      </p>
      <div className="flex flex-col items-center justify-center gap-2 mt-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onCreateTemplate}
          className="flex items-center w-full"
        >
          <PlusCircle className="h-4 w-4 mr-1" />
          {getMessage('createFirstTemplate', undefined, 'Create Your First Template')}
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onRefresh}
          className="flex items-center mt-2"
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? getMessage('refreshing', undefined, 'Refreshing...') : getMessage('refresh', undefined, 'Refresh')}
        </Button>
      </div>
    </div>
  );
};

export default EmptyState;