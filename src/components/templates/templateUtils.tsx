// src/components/panels/TemplatesPanel/utils/templateUtils.ts

import { Template } from '@/types/prompts/templates';

/**
 * Format template usage date for display
 */
export function formatUsageDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return '';
    }
    
    // Calculate the difference in days
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // Display relative time for recent dates
    if (diffDays === 0) {
      return 'today';
    } else if (diffDays === 1) {
      return 'yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    }
    
    // Format date for older dates
    return date.toLocaleDateString(undefined, { 
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

/**
 * Determine if a template is popular based on usage count
 */
export function isTemplatePopular(template: Template): boolean {
  const usageCount = typeof template.usage_count === 'number' ? template.usage_count : 0;
  return usageCount >= 5; // Consider popular if used 5 or more times
}

/**
 * Get safe template title with fallback
 */
export function getTemplateTitle(template: Template): string {
  return template.title || 'Untitled Template';
}

/**
 * Sort templates by usage count (descending)
 */
export function sortTemplatesByUsage(templates: Template[]): Template[] {
  return [...templates].sort((a, b) => {
    const aCount = typeof a.usage_count === 'number' ? a.usage_count : 0;
    const bCount = typeof b.usage_count === 'number' ? b.usage_count : 0;
    return bCount - aCount;
  });
}

/**
 * Sort templates by last used date (most recent first)
 */
export function sortTemplatesByLastUsed(templates: Template[]): Template[] {
  return [...templates].sort((a, b) => {
    const aDate = a.last_used_at ? new Date(a.last_used_at).getTime() : 0;
    const bDate = b.last_used_at ? new Date(b.last_used_at).getTime() : 0;
    return bDate - aDate;
  });
}

/**
 * Format templates for display, enriching with additional properties
 */
export function formatTemplatesForDisplay(templates: Template[]): Template[] {
  return templates.map(template => ({
    ...template,
    displayTitle: getTemplateTitle(template),
    isPopular: isTemplatePopular(template),
    formattedLastUsed: template.last_used_at ? formatUsageDate(template.last_used_at) : ''
  }));
}