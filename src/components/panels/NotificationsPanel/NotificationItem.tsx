// src/components/NotificationsPanel/NotificationItem.tsx
import React from 'react';
import { notificationService } from '@/services/notifications/NotificationService';
import { NotificationBase } from '@/types/notifications';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Trash2, Check, ExternalLink } from 'lucide-react';

interface NotificationItemProps {
  notification: NotificationBase;
  onDismiss: (notification: NotificationBase, e: React.MouseEvent) => Promise<void>;
  onDelete: (notification: NotificationBase, e: React.MouseEvent) => Promise<void>;
  onActionClick: (notification: NotificationBase) => Promise<void>;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onDismiss,
  onDelete,
  onActionClick
}) => {
  // Parse notification time
  const timeAgo = notification.created_at 
    ? formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })
    : '';
    
  // Check if notification is read
  const isRead = !!notification.read_at;
  
  // Get action button details from metadata
  const actionButton = notificationService.getActionButton(notification);
  console.log("actionbutton", actionButton);
  
  // Handle notification click
  const handleClick = async () => {
    if (!isRead) {
      await onDismiss(notification, {} as React.MouseEvent);
    }
    await onActionClick(notification);
  };
  
  return (
    <div 
      className={`
        group relative flex flex-col p-3 border-b border-gray-700 
        ${isRead ? 'bg-background' : 'bg-background/50'} 
        hover:bg-gray-700 
        transition-colors duration-200 cursor-pointer
      `}
    >
      {/* Main notification content */}
      <div className="flex items-start gap-2" onClick={handleClick}>
        {/* Notification status indicator */}
        {!isRead && (
          <div className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
        )}
        
        {/* Notification content */}
        <div className="flex-1">
          {/* Title row with timestamp */}
          <div className="flex justify-between items-start mb-1">
            <h4 className={`text-sm font-medium pr-12 ${isRead ? 'text-gray-300' : 'text-white'}`}>
              {notification.title}
            </h4>
            <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
              {timeAgo}
            </span>
          </div>
          
          {/* Message body */}
          <p className={`text-sm mt-1 ${isRead ? 'text-gray-400' : 'text-gray-300'}`}>
            {notification.body}
          </p>
          
          {/* Bottom row with action buttons */}
          <div className="mt-2 flex justify-between items-center">
            {/* Action button (if available) from metadata */}
            <div className="flex-1">
              {actionButton && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="text-xs px-3 py-1 h-7 flex items-center gap-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    onActionClick(notification);
                  }}
                >
                  <ExternalLink className="h-3 w-3" />
                  {actionButton.title}
                </Button>
              )}
            </div>
            
            {/* Action icons (mark as read/delete) */}
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {!isRead && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 rounded-full bg-green-900/20 hover:bg-green-800/30"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDismiss(notification, e);
                  }}
                  title="Mark as read"
                >
                  <Check className="h-3.5 w-3.5 text-green-400" />
                </Button>
              )}
              
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 rounded-full bg-red-900/20 hover:bg-red-800/30"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(notification, e);
                }}
                title="Delete notification"
              >
                <Trash2 className="h-3.5 w-3.5 text-red-400" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;