// src/components/templates/TemplateItem.tsx (Consistent styling)
import React from 'react';
import { FileText, Edit, Clock, Activity, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Template } from '@/types/prompts/templates';
import { useTemplateActions } from '@/hooks/prompts'; // Updated import from hooks directly
import { getMessage } from '@/core/utils/i18n';

interface TemplateItemProps {
  template: Template;
  type?: 'official' | 'organization' | 'user';
  onEditTemplate?: (template: Template) => void;
  onDeleteTemplate?: (templateId: number) => Promise<boolean> | void;
  onUseTemplate?: (template: Template) => void;
}

/**
 * Enhanced component for rendering a single template item with usage stats and colored action buttons
 */
export function TemplateItem({
  template,
  type = 'user',
  onEditTemplate,
  onDeleteTemplate,
  onUseTemplate
}: TemplateItemProps) {
  // Use our template actions hook
  const { isProcessing, useTemplate: defaultUseTemplate } = useTemplateActions();
  
  // Use the provided use function or fall back to the hook's function
  const handleUseTemplate = onUseTemplate || defaultUseTemplate;
  
  // Ensure we have a display name, falling back through various options
  const displayName = template.title || 'Untitled Template';
  
  // Safely handle usage count
  const usageCount = typeof template.usage_count === 'number' ? template.usage_count : 0;
  
  // Format last used date if available
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return null;
      
      // Check if it's today
      const today = new Date();
      if (date.toDateString() === today.toDateString()) {
        return 'today';
      }
      
      // Check if it's yesterday
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (date.toDateString() === yesterday.toDateString()) {
        return 'yesterday';
      }
      
      // Otherwise return formatted date
      return date.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric'
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return null;
    }
  };
  
  const lastUsedText = formatDate(template.last_used_at);
  
  // Render usage indicator based on frequency - only for user templates
  const renderUsageIndicator = () => {
    // Don't show usage indicators for non-user templates
    if (type !== 'user') {
      return null;
    }
    
    if (usageCount === 0) {
      return null;
    }
    
    if (usageCount >= 5) {
      // Popular template
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center text-xs text-primary">
                <Activity className="h-3 w-3 mr-1 text-primary" />
                <span>{getMessage('popular', undefined, 'Popular')}</span>
                <Badge variant="outline" className="ml-1 h-4 px-1 py-0 text-xs">
                  {usageCount}
                </Badge>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{getMessage('used_times', {count: usageCount}, `Used ${usageCount} times`)}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    
    if (lastUsedText) {
      // Recently used template
      return (
        <div className="flex items-center text-xs text-muted-foreground">
          <Clock className="h-3 w-3 mr-1" />
          <span>{getMessage('last_used', {date: lastUsedText}, `Last used ${lastUsedText}`)}</span>
        </div>
      );
    }
    
    // Default usage count
    return (
      <div className="text-xs text-muted-foreground">
        <p>{getMessage('used_times', {count: usageCount}, `Used ${usageCount} times`)}</p>
      </div>
    );
  };

  // Handle template click to use it
  const handleTemplateClick = () => {
    handleUseTemplate(template);
  };
  
  // Handle edit click (only for user templates)
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEditTemplate) {
      onEditTemplate(template);
    }
  };
  
  // Handle delete click
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteTemplate && template.id) {
      // Call the delete handler
      onDeleteTemplate(template.id);
    }
  };
  
  return (
    <div 
      className={`flex items-center p-2 hover:bg-accent/60 rounded-sm cursor-pointer group ${isProcessing ? 'opacity-50' : ''}`}
      onClick={handleTemplateClick}
    >
      <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
      <div className="flex-1 min-w-0">
        <div className="text-sm truncate">
          {displayName}
        </div>
        {template.description && (
          <div className="text-xs text-muted-foreground truncate">{template.description}</div>
        )}
        {/* Usage indicator  {renderUsageIndicator()}*/}
        
      </div>
      
      {/* Only show action buttons for user templates */}
      {type === "user" && (
        <div className="ml-2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Edit Button with blue accent */}
          {onEditTemplate && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 w-7 p-0 text-blue-800 bg-transparent  rounded hover:text-white hover:bg-blue-600 dark:text-blue-200 dark:bg-transparent  dark:hover:text-black dark:hover:bg-blue-200"
                    onClick={handleEditClick}
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Edit template</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {/* Delete Button with red accent */}
          {onDeleteTemplate && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30"
                    onClick={handleDeleteClick}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Delete template</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      )}
    </div>
  );
}