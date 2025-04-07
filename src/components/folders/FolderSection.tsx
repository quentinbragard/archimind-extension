// src/components/folders/FolderSection.tsx
import { ReactNode, useState } from 'react';
import { BookTemplate, Users, Folder, PlusCircle, ChevronDown, Building2, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMessage } from '@/core/utils/i18n';

interface FolderSectionProps {
  title: string;
  iconType: 'official' | 'organization' | 'user';
  onBrowseMore?: () => void;
  onCreateTemplate?: () => void;
  showBrowseMore?: boolean;
  showCreateButton?: boolean;
  isEmpty?: boolean; // New prop to check if content is empty
  children: ReactNode;
}

/**
 * Component for rendering a section of template folders with appropriate controls
 */
export function FolderSection({
  title,
  iconType,
  onBrowseMore,
  onCreateTemplate,
  showBrowseMore = false,
  showCreateButton = false,
  isEmpty = false,
  children
}: FolderSectionProps) {
  // Select the appropriate icon based on the iconType
  const renderIcon = () => {
    switch (iconType) {
      case 'official':
        return <BookTemplate className="mr-2 h-4 w-4" />;
      case 'organization':
        return <Users className="mr-2 h-4 w-4" />;
      case 'user':
      default:
        return <Folder className="mr-2 h-4 w-4" />;
    }
  };

  // Handle contact sales click
  const handleContactSales = () => {
    window.open('https://www.jayd.ai/#Contact', '_blank');
  };

  // Render organization CTA if it's an organization section and it's empty
  const renderOrganizationCTA = () => {
    if (iconType === 'organization' && isEmpty) {
      return (
        <div className="flex flex-col gap-3 p-4 my-2 rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-800/60 dark:to-gray-900/60 border border-slate-200/80 dark:border-amber-500/20 shadow-sm">
          {/* Header with icon and badge */}
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30">
              <Building2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm font-medium text-gray-800 dark:text-gray-100">
                {getMessage('organization_templates_title', undefined, 'Enterprise Templates')}
              </h3>
              <div className="flex items-center gap-1">
                <Lock className="h-2.5 w-2.5 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                  {getMessage('enterprise_feature', undefined, 'Enterprise Feature')}
                </span>
              </div>
            </div>
          </div>
          
          {/* Description */}
          <p className="text-xs text-gray-600 dark:text-gray-300">
            {getMessage('organization_templates_description', undefined, 
              'Access to organization templates is an enterprise feature. Contact us to enable this for your team.')}
          </p>
          
          {/* Action button */}
          <Button 
            variant="outline"
            size="sm"
            className="mt-1 w-full bg-white/70 dark:bg-gray-800/40 border-amber-200 dark:border-amber-800/30 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-800 dark:hover:text-amber-300 transition-colors"
            onClick={handleContactSales}
          >
            <Mail className="h-3 w-3 mr-2" />
            {getMessage('contact_enterprise_sales', undefined, 'Contact Sales')}
          </Button>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <div className="flex items-center justify-between text-sm font-medium text-muted-foreground mb-2 px-2">
        <div className="flex items-center">
          {renderIcon()}
          {title}
        </div>
        
        {/* Show Browse More button */}
        {showBrowseMore && onBrowseMore && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={onBrowseMore}
          >
            <ChevronDown className="h-3.5 w-3.5 mr-1" />
            {getMessage('browseMore', undefined, 'Browse More')}
          </Button>
        )}
        
        {/* Show Create button */}
        {showCreateButton && onCreateTemplate && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={onCreateTemplate}
            title={getMessage('newTemplate', undefined, 'New Template')}
          >
            <PlusCircle className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {/* Organization CTA if applicable */}
      {renderOrganizationCTA()}
      
      {/* Show children only if not showing organization CTA */}
      {!(iconType === 'organization' && isEmpty) && children}
    </div>
  );
}