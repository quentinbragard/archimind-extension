// src/components/Main.tsx
import React, { useEffect } from 'react';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/state/AuthContext';
import MainButton from '@/components/MainButton';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { DialogProvider } from '@/components/dialogs';
import { QueryProvider } from '@/providers/QueryProvider';
/**
 * Main app component that brings everything together
 * Handles providers, global UI elements, and lazy-loaded components
 */
const Main: React.FC = () => {
  // Ensure dialog system is properly setup
  useEffect(() => {
    // Check if dialog manager is properly initialized
    const checkDialogManager = () => {
      if (!window.dialogManager) {
        console.warn('Dialog manager not found, will try to initialize from DialogProvider');
      } else {
        console.log('Dialog manager is available in global scope');
      }
    };

    // Run check after component mount
    checkDialogManager();
    
    // Set a timeout to check again in case of initialization delay
    const timeoutId = setTimeout(checkDialogManager, 1000);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        {/* Add QueryProvider to wrap DialogProvider */}
        <QueryProvider>
          <DialogProvider>
            {/* UI Components */}
              <MainButton />
            {/* Toast notifications */}
            <Toaster richColors position="top-right" />
          </DialogProvider>
        </QueryProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default Main;