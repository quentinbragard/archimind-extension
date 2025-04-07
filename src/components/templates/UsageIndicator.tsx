// src/components/panels/TemplatesPanel/components/UsageIndicator.tsx

import React from 'react';
import { Sparkles, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Template } from '@/types/prompts/templates';
import { formatUsageDate } from './templateUtils';

interface UsageIndicatorProps {
  template: Template;
}

/**
 * Component for displaying template usage statistics
 * Shows different indicators based on usage frequency
 */
const UsageIndicator: React.FC<UsageIndicatorProps> = ({ template }) => {
  // Safely handle usage count
  const usageCount = typeof template.usage_count === 'number' ? template.usage_count : 0;
  
  // Determine if template is frequently used (more than 5 times)
  const isPopular = usageCount >= 5;

  // Format last used date if available
  const lastUsed = template.last_used_at ? formatUsageDate(template.last_used_at) : null;
  
  // If template has never been used, don't show anything
  if (usageCount === 0) {
    return null;
  }
  
  // For popular templates, show a sparkles badge
  if (isPopular) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center text-xs text-muted-foreground">
              <Badge variant="secondary" className="px-1 py-0 h-4 mr-1">
                <Sparkles className="h-3 w-3 text-yellow-500" />
              </Badge>
              Popular • Used {usageCount} times
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>This template is frequently used</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  // For recently used templates, show the last used date
  if (lastUsed) {
    return (
      <div className="flex items-center text-xs text-muted-foreground">
        <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
        <span>Last used {lastUsed}</span>
      </div>
    );
  }
  
  // Default case: just show the usage count
  return (
    <div className="text-xs text-muted-foreground">
      Used {usageCount} {usageCount === 1 ? 'time' : 'times'}
    </div>
  );
};

export default UsageIndicator;