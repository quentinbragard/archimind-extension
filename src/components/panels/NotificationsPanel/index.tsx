// src/components/NotificationsPanel/NotificationsPanel.tsx
import React, { useEffect } from 'react';
import { useNotifications } from '@/hooks/notifications/useNotifications';
import NotificationItem from './NotificationItem';
import { Button } from '@/components/ui/button';
import { Bell, RefreshCw, Loader2, CheckSquare } from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import BasePanel from '../BasePanel';
import { getMessage } from '@/core/utils/i18n';
import { cn } from '@/core/utils/classNames';

interface NotificationsPanelProps {
  showBackButton?: boolean;
  onBack?: () => void;
  onClose?: () => void;
  maxHeight?: string;
}

/**
 * Panel that displays user notifications with read/unread status
 */
const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ 
  showBackButton,
  onBack,
  onClose, 
  maxHeight = '75vh' 
}) => {
  const {
    notifications,
    loading,
    unreadCount,
    handleMarkAllAsRead,
    handleActionClick,
    handleDismiss,
    handleDelete,
    isRefreshing,
    refresh,
  } = useNotifications();

  // Listen for external open notification requests
  useEffect(() => {
    const handleOpenNotifications = () => {
      // If there's an external request to open notifications,
      // refresh the notifications
      refresh();
    };

    document.addEventListener(
      'jaydai:open-notifications',
      handleOpenNotifications
    );

    return () => {
      document.removeEventListener(
        'jaydai:open-notifications',
        handleOpenNotifications
      );
    };
  }, [refresh]);

  // Create header content
  const headerLeftExtra = unreadCount > 0 ? (
    <span className={cn(
      "bg-red-500 text-white text-xs px-2 py-0.5 rounded-full",
      "ml-2"
    )}>
      {unreadCount}
    </span>
  ) : null;

  const headerRightContent = (
    <Button
      size="sm"
      variant="ghost"
      className="h-8 w-8 p-0 rounded-full flex items-center justify-center"
      onClick={refresh}
      disabled={isRefreshing || loading}
      title="Refresh notifications"
    >
      {isRefreshing ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <RefreshCw className="h-4 w-4" />
      )}
    </Button>
  );

  return (
    <BasePanel
      title={getMessage('notifications', undefined, "Notifications")}
      icon={Bell}
      showBackButton={showBackButton}
      onBack={onBack}
      onClose={onClose}
      className="w-80"
      maxHeight={maxHeight}
      headerClassName="flex items-center justify-between"
      headerExtra={headerRightContent}
      headerLeftExtra={headerLeftExtra}
    >
      {/* Notification Controls */}
      {unreadCount > 1 && (
        <div className="flex items-center justify-start mb-4 pb-2 w-full px-4 border-b border-gray-700">
          {/* Mark all read button */}
          <Button
            size="sm"
            variant="outline"
            className="text-xs flex items-center gap-1 h-7"
            onClick={handleMarkAllAsRead}
            disabled={isRefreshing || loading}
            title="Mark all as read"
          >
            <CheckSquare className="h-3.5 w-3.5" />
            Mark all read
          </Button>
        </div>
      )}

      {/* Notification Content */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner size="md" message="Loading notifications..." />
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col justify-center items-center py-10 text-gray-400 p-4 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-3">
            <Bell className="h-8 w-8 text-gray-500" />
          </div>
          <p className="font-medium">No notifications</p>
          <p className="text-xs mt-1 max-w-xs">
            We'll notify you when there are new updates or important information
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4"
            onClick={refresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Check for notifications
              </>
            )}
          </Button>
        </div>
      ) : (
        <>
          {/* Notification List */}
          <div className="divide-y divide-gray-700">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onDismiss={handleDismiss}
                onDelete={handleDelete}
                onActionClick={handleActionClick}
              />
            ))}
          </div>
          
          {/* Footer count */}
          <div className="mt-4 pt-2 border-t border-gray-700 flex justify-between items-center text-xs text-gray-400">
            {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
          </div>
        </>
      )}
    </BasePanel>
  );
};

export default NotificationsPanel;