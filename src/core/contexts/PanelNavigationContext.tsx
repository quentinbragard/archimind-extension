// src/core/contexts/PanelNavigationContext.tsx

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { PanelType } from '@/hooks/ui/useMainButtonState';

export interface PanelConfig {
  type: PanelType;
  props?: any;
}

interface PanelNavigationContextProps {
  panelStack: PanelConfig[];
  currentPanel: PanelConfig;
  pushPanel: (panel: PanelConfig) => void;
  popPanel: () => void;
  resetNavigation: (initialPanel: PanelConfig) => void;
}

const PanelNavigationContext = createContext<PanelNavigationContextProps | undefined>(undefined);

interface PanelNavigationProviderProps {
  children: ReactNode;
  initialPanel: PanelConfig;
}

/**
 * Context provider for panel navigation
 */
export const PanelNavigationProvider: React.FC<PanelNavigationProviderProps> = ({ 
  children,
  initialPanel = { type: 'menu' }
}) => {
  const [panelStack, setPanelStack] = useState<PanelConfig[]>([initialPanel]);
  
  // Get the current panel (last one in the stack)
  const currentPanel = panelStack[panelStack.length - 1];
  
  // Add a new panel to the stack
  const pushPanel = (panel: PanelConfig) => {
    setPanelStack(prev => [...prev, panel]);
  };
  
  // Remove the last panel from the stack
  const popPanel = () => {
    if (panelStack.length > 1) {
      setPanelStack(prev => prev.slice(0, -1));
    }
  };
  
  // Reset the navigation stack with a new initial panel
  const resetNavigation = (newInitialPanel: PanelConfig) => {
    setPanelStack([newInitialPanel]);
  };
  
  return (
    <PanelNavigationContext.Provider value={{ 
      panelStack, 
      currentPanel, 
      pushPanel, 
      popPanel,
      resetNavigation
    }}>
      {children}
    </PanelNavigationContext.Provider>
  );
};

/**
 * Hook to use panel navigation
 */
export const usePanelNavigation = (): PanelNavigationContextProps => {
  const context = useContext(PanelNavigationContext);
  if (context === undefined) {
    throw new Error('usePanelNavigation must be used within a PanelNavigationProvider');
  }
  return context;
};