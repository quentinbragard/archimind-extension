// src/components/templates/UnorganizedTemplates.tsx
import React from 'react';
import { Template } from '@/types/prompts/templates';
import { TemplateItem } from './TemplateItem';
import { getMessage } from '@/core/utils/i18n';

interface UnorganizedTemplatesProps {
  templates: Template[];
  onEditTemplate?: (template: Template) => void;
  onDeleteTemplate?: (templateId: number) => Promise<boolean> | void;
}

/**
 * Component for displaying templates that have no assigned folder (null folder_id)
 */
export function UnorganizedTemplates({
  templates,
  onEditTemplate,
  onDeleteTemplate
}: UnorganizedTemplatesProps) {
  // If there are no unorganized templates, don't render anything
  if (!templates || templates.length === 0) {
    return null;
  }

  return (
    <div className="mt-2">
      <div className="space-y-1">
        {templates.map(template => (
          <TemplateItem
            key={`template-${template.id}`}
            template={template}
            type="user"
            onEditTemplate={onEditTemplate}
            onDeleteTemplate={onDeleteTemplate}
          />
        ))}
      </div>
    </div>
  );
}

