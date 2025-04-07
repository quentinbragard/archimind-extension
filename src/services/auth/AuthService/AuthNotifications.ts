// src/services/auth/AuthNotifications.ts
import { toast } from 'sonner';
import { emitEvent, AppEvent } from '@/core/events/events';
import { AuthErrorCode } from '@/types';

export class AuthNotifications {
  /**
   * Show session expired notification
   */
  public static showSessionExpiredNotification(): void {
    toast.error('Session Expired', {
      description: 'Your session has expired. Please sign in again.',
      action: {
        label: 'Sign In',
        onClick: () => {
          // Trigger sign-in dialog
          document.dispatchEvent(new CustomEvent('jaydai:show-auth-modal', {
            detail: { mode: 'signin', isSessionExpired: true }
          }));
        }
      }
    });
  }
  
  /**
   * Show sign out confirmation
   */
  public static showSignOutConfirmation(): void {
    toast.success('Signed Out', {
      description: 'You have been successfully signed out.'
    });
  }
  
  /**
   * Emit auth error event
   */
  public static notifyAuthError(errorCode: AuthErrorCode, errorMessage: string | null): void {
    document.dispatchEvent(new CustomEvent('jaydai:auth-error', {
      detail: { errorCode }
    }));
    
    // Also emit through the event system
    emitEvent(AppEvent.AUTH_ERROR, { 
      message: errorMessage || 'Authentication error', 
      code: errorCode 
    });
  }
}