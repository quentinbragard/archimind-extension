// src/components/MainButton.tsx

import { useEffect } from 'react';
import { Toaster } from "sonner";
import { Button } from '@/components/ui/button';
import { X } from "lucide-react";
import PanelManager from '@/components/panels/PanelManager';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { useMainButtonState } from '@/hooks/ui/useMainButtonState';
import { getMessage } from '@/core/utils/i18n';

/**
 * Main floating button component that opens various panels
 */
const MainButton = () => {
  const {
    isOpen,
    panelType,
    setPanelType,
    notificationCount,
    buttonRef,
    toggleMenu,
    handleClosePanel,
  } = useMainButtonState();

  // We don't need this event listener anymore because it's handled in useMainButtonState
  // But keeping the component structure for reference
  useEffect(() => {
    // Any additional component-specific initialization can go here
    
    return () => {
      // Cleanup if needed
    };
  }, []);

  return (
    <ErrorBoundary>
      <div className="fixed bottom-6 right-8 z-[9999]">
        <div className="relative">
          {/* Panel Manager */}
          <PanelManager
            isOpen={isOpen}
            onClose={handleClosePanel}
            notificationCount={notificationCount}
            activePanelType={panelType}
          />

          {/* Main Button with logo */}
          <div className="relative w-16 h-16">
            <Button 
              ref={buttonRef}
              onClick={toggleMenu}
              className="bg-transparent hover:bg-transparent hover:scale-125 transition-all duration-300 w-full h-full rounded-full p-0 overflow-hidden flex items-center justify-center"
            >
              <img 
                src={document.documentElement.classList.contains('dark') 
                  ? "https://vetoswvwgsebhxetqppa.supabase.co/storage/v1/object/public/images/jaydai-extension-logo.png" 
                  : "https://vetoswvwgsebhxetqppa.supabase.co/storage/v1/object/public/images/jaydai-extension-logo-dark.png"} 
                alt={getMessage('appName', undefined, 'Jaydai Chrome Extension')} 
                className="w-full h-full object-cover"
              />
              
              {/* Optional overlay icon when open */}
              {isOpen && (
                <div className="absolute top-1 right-1 bg-white rounded-full p-1 z-10">
                  <X className="h-4 w-4 text-gray-800" />
                </div>
              )}
            </Button>
            
            {/* Notification Badge */}
            {notificationCount > 0 && !isOpen && (
              <span 
                className="absolute -top-1 -right-1 
                  bg-red-500 text-white 
                  text-xs font-semibold 
                  rounded-full 
                  w-5 h-5 
                  flex items-center justify-center 
                  z-20 
                  border border-white 
                  shadow-sm 
                  hover:bg-red-600 
                  transition-colors duration-200"
              >
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </div>
        </div>
        <Toaster richColors position="top-right" />
      </div>
    </ErrorBoundary>
  );
};

export default MainButton;