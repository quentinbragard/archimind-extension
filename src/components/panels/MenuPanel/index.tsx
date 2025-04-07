// src/components/panels/MenuPanel/index.tsx

import React from 'react';
import { MenuIcon, FileText, Bell, BarChart, Settings, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { usePanelNavigation } from '@/core/contexts/PanelNavigationContext';
import BasePanel from '../BasePanel';
import { getMessage } from '@/core/utils/i18n';
import { toast } from 'sonner';

interface MenuPanelProps {
  onClose: () => void;
  notificationCount: number;
}

/**
 * Root menu panel that allows navigation to other panels
 */
const MenuPanel: React.FC<MenuPanelProps> = ({
  onClose,
  notificationCount,
}) => {
  const { pushPanel } = usePanelNavigation();

  // Handle navigation to other panels
  const handleNavigate = (panelType: 'templates' | 'notifications' | 'stats') => {
    pushPanel({ type: panelType });
  };

  // Handle settings click - open settings dialog
  const handleSettingsClick = () => {
    if (window.dialogManager) {
      window.dialogManager.openDialog('settings');
    } else {
      console.error('Dialog manager not available');
      toast.error('Could not open settings. Please try again.');
    }
  };

  // Handle AI news click - open external link
  const handleAiNewsClick = () => {
    window.open('https://thetunnel.substack.com/?utm_source=jaydai-extension', '_blank');
  };

  return (
    <BasePanel
      title={getMessage('menu', undefined, 'Menu')}
      icon={MenuIcon}
      onClose={onClose}
      className="w-56"
    >
      <Card className="p-1 shadow-none border-0 bg-background text-foreground">
        <div className="flex flex-col space-y-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="justify-start" 
            onClick={() => handleNavigate('templates')}
          >
            <FileText className="mr-2 h-4 w-4" /> 
            {getMessage('templates', undefined, 'Templates')}
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="justify-start" 
            onClick={() => handleNavigate('stats')}
          >
            <BarChart className="mr-2 h-4 w-4" /> 
            {getMessage('aiStats', undefined, 'AI Stats')}
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="justify-start" 
            onClick={() => handleNavigate('notifications')}
          >
            <Bell className="mr-2 h-4 w-4" /> 
            {getMessage('notifications', undefined, 'Notifications')}
            {notificationCount > 0 && (
              <span className="ml-auto  bg-red-500 text-white rounded-full text-xs px-1.5 py-0.5">
                {notificationCount}
              </span>
            )}
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="justify-start" 
            onClick={handleAiNewsClick}
          >
            <Save className="mr-2 h-4 w-4" /> 
            {getMessage('aiNews', undefined, 'AI News')}
          </Button>
          
         {/*} <Button 
            variant="ghost" 
            size="sm" 
            className="justify-start" 
            onClick={handleSettingsClick}
          >
            <Settings className="mr-2 h-4 w-4" /> 
            {getMessage('settings', undefined, 'Settings')}
          </Button> */}
        </div>
      </Card>
    </BasePanel>
  );
};

export default MenuPanel;