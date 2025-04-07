// src/components/panels/BasePanel.tsx

import React, { ReactNode } from 'react';
import { cn } from "@/core/utils/classNames";
import PanelHeader from './PanelHeader';

export interface BasePanelProps {
  title?: string;
  icon?: React.ComponentType<{ className?: string }>;
  showBackButton?: boolean;
  onBack?: () => void;
  onClose?: () => void;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  children: ReactNode;
  maxHeight?: string;
  headerExtra?: ReactNode;
  headerLeftExtra?: ReactNode;
}

/**
 * Base Panel component that all panels should extend.
 * Provides consistent layout, header with title and navigation,
 * and content area with optional max height.
 */
export const BasePanel: React.FC<BasePanelProps> = ({ 
  title,
  icon,
  showBackButton = false,
  onBack,
  onClose,
  className,
  headerClassName,
  contentClassName,
  children,
  maxHeight = '75vh',
  headerExtra,
  headerLeftExtra
}) => {
  return (
    <div className={cn("panel-container rounded-md overflow-hidden shadow-lg", className)}>
      <PanelHeader 
        title={title}
        icon={icon}
        showBackButton={showBackButton}
        onBack={onBack}
        onClose={onClose}
        className={headerClassName}
        extra={headerExtra}
        leftExtra={headerLeftExtra}
      />
      
      <div 
        className={cn("panel-content bg-background p-2", contentClassName)}
        style={{ maxHeight, overflowY: 'auto' }}
      >
        {children}
      </div>
    </div>
  );
};

export default BasePanel;