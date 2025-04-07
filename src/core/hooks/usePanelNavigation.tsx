// src/core/hooks/usePanelNavigation.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { PanelType, PanelState, PanelNavigationContext } from '../../types/panel';

// Default initial panel
const DEFAULT_PANEL: PanelState = { type: 'menu' };

// Create the context
const PanelNavigationContext = createContext<PanelNavigationContext>({
  currentPanel: DEFAULT_PANEL,
  panelStack: [DEFAULT_PANEL],
  pushPanel: () => {},
  popPanel: () => {},
  replacePanel: () => {},
  resetNavigation: () => {}
});

/**
 * Provider component for panel navigation
 */
export const PanelNavigationProvider: React.FC<{
  initialPanel?: PanelState;
  children: React.ReactNode;
}> = ({ initialPanel = DEFAULT_PANEL, children }) => {
  const [panelStack, setPanelStack] = useState<PanelState[]>([initialPanel]);
  
  // Push a new panel onto the stack
  const pushPanel = useCallback((panel: PanelState) => {
    setPanelStack(prevStack => [...prevStack, panel]);
  }, []);
  
  // Pop the latest panel from the stack
  const popPanel = useCallback(() => {
    setPanelStack(prevStack => {
      // Don't pop if only one panel left
      if (prevStack.length <= 1) return prevStack;
      return prevStack.slice(0, prevStack.length - 1);
    });
    
  }, []);
  
  // Replace the current panel
  const replacePanel = useCallback((panel: PanelState) => {
    setPanelStack(prevStack => {
      if (prevStack.length === 0) return [panel];
      return [...prevStack.slice(0, prevStack.length - 1), panel];
    });
  }, []);
  
  // Reset to initial panel
  const resetNavigation = useCallback(() => {
    setPanelStack([initialPanel]);
  }, [initialPanel]);
  
  // Get the current panel (last in stack)
  const currentPanel = panelStack[panelStack.length - 1] || DEFAULT_PANEL;
  
  const contextValue: PanelNavigationContext = {
    currentPanel,
    panelStack,
    pushPanel,
    popPanel,
    replacePanel,
    resetNavigation
  };
  
  return (
    <PanelNavigationContext.Provider value={contextValue}>
      {children}
    </PanelNavigationContext.Provider>
  );
};

/**
 * Hook to use panel navigation
 */
export function usePanelNavigation(): PanelNavigationContext {
  const context = useContext(PanelNavigationContext);
  
  if (!context) {
    throw new Error('usePanelNavigation must be used within a PanelNavigationProvider');
  }
  
  return context;
}