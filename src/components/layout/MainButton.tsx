import React from 'react';
import { Toaster } from "sonner";
import { PanelNavigationProvider } from '@/core/hooks/usePanelNavigation';
import { Button } from '@/components/ui/button';
import { X } from "lucide-react";
import MenuPanel from '@/components/panels/MenuPanel';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { useMainButtonState } from '@/hooks/ui/useMainButtonState';

/**
 * Main floating button component that opens various panels
 */
interface MainButtonProps {
  onSettingsClick?: () => void;
  onSaveClick?: () => void;
}

const MainButton: React.FC<MainButtonProps> = ({ 
  onSettingsClick, 
  onSaveClick 
}) => {
  const {
    isOpen,
    notificationCount,
    imageLoaded,
    buttonRef,
    menuRef,
    toggleMenu,
    handleClosePanel,
    handleImageLoad,
    handleImageError,
    handleSaveClick,
    handleSettingsClick,
    isPlaceholderEditorOpen,
    setIsPlaceholderEditorOpen
  } = useMainButtonState({ onSettingsClick, onSaveClick });

  return (
    <ErrorBoundary>
      <div className="fixed bottom-6 right-2 z-[9999]">
        <div className="relative w-24 h-24 flex items-center justify-center">
          {/* Panel that appears above the main button */}
          <PanelNavigationProvider>
            {isOpen && (
              <MenuPanel
                isOpen={isOpen}
                notificationCount={notificationCount}
                menuRef={menuRef}
                onClosePanel={handleClosePanel}
                onSettingsClick={handleSettingsClick}
                setIsPlaceholderEditorOpen={setIsPlaceholderEditorOpen}
              />
            )}
          </PanelNavigationProvider>

          {/* Main Button with logo */}
          <div className="relative w-16 h-16">
            <Button 
              ref={buttonRef}
              onClick={toggleMenu}
              className="bg-transparent w-full h-full rounded-full shadow-lg p-0 overflow-hidden flex items-center justify-center"
            >
              <img 
                src="https://gjszbwfzgnwblvdehzcq.supabase.co/storage/v1/object/public/chrome_extension_assets/archimind-logo.png" 
                alt="Archimind Logo" 
                className="w-full h-full object-cover"
                onLoad={handleImageLoad}
                onError={handleImageError}
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