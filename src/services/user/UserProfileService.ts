// src/services/user/UserProfileService.ts
import { AbstractBaseService } from '../BaseService';
import { UserMetadata } from '@/types/services/conversation';
import { emitEvent, AppEvent } from '@/core/events/events';
import { errorReporter } from '@/core/errors/ErrorReporter';
import { AppError, ErrorCode } from '@/core/errors/AppError';
import { debug } from '@/core/config';
import { userApi } from '@/services/api/UserApi';

/**
 * Service for managing user profile information
 * Handles user data storage, retrieval, and updates
 */
export class UserProfileService extends AbstractBaseService {
  private static instance: UserProfileService;
  private userInfo: UserMetadata | null = null;
  private fetchedUserInfo: boolean = false;
  private storageKey: string = 'archimind_user_info';
  
  private constructor() {
    super();
  }
  
  public static getInstance(): UserProfileService {
    if (!UserProfileService.instance) {
      UserProfileService.instance = new UserProfileService();
    }
    return UserProfileService.instance;
  }
  
  /**
   * Initialize the user profile service
   */
  protected async onInitialize(): Promise<void> {
    debug('Initializing UserProfileService');
    
    // First try to get from storage
    this.getUserInfoFromStorage().then(data => {
      if (data) {
        this.processUserInfo(data);
        this.fetchedUserInfo = true;
      }
    });
    
    // Add event listener for user data directly instead of using networkRequestMonitor
    document.addEventListener('jaydai:user-info', this.handleUserInfoEvent);
  }
  
  /**
   * Clean up resources
   */
  protected onCleanup(): void {
    // Remove event listener
    document.removeEventListener('jaydai:user-info', this.handleUserInfoEvent);
    
    debug('UserProfileService cleaned up');
  }
  
  /**
   * Handle user info event directly
   */
  private handleUserInfoEvent = (event: CustomEvent): void => {
    try {
      const data = event.detail;
      if (!data || !data.responseBody) return;
      
      this.handleUserInfoCapture(data.responseBody);
    } catch (error) {
      errorReporter.captureError(
        new AppError('Error handling user info event', ErrorCode.EXTENSION_ERROR, error)
      );
    }
  };
  
  /**
   * Process user information
   */
  public handleUserInfoCapture(userData: any): void {
    try {
      debug('User info captured from network');
      
      // Verify this is complete user data with email
      if (userData && userData.email && userData.email !== '') {
        this.processUserInfo(userData);
        this.fetchedUserInfo = true;
        this.saveUserInfoToStorage(userData);
        
        // Emit event for other components
        emitEvent(AppEvent.USER_INFO_UPDATED, {
          email: userData.email,
          name: userData.name || userData.email.split('@')[0]
        });
      }
    } catch (error) {
      errorReporter.captureError(
        new AppError('Error handling user info capture', ErrorCode.API_ERROR, error)
      );
    }
  }
  
  /**
   * Process user information from API
   */
  public processUserInfo(data: any): void {
    try {
      if (!data || !data.id || !data.email) {
        return;
      }
      
      // Extract org name if available
      let orgName = null;
      if (data.orgs && data.orgs.data && data.orgs.data.length > 0) {
        orgName = data.orgs.data[0].title || null;
      }
      
      // Build user metadata
      this.userInfo = {
        id: data.id,
        email: data.email,
        name: data.name || data.email.split('@')[0],
        picture: data.picture || null,
        phone_number: data.phone_number || null,
        org_name: orgName
      };
      
      // Save to backend
      this.saveUserMetadataToBackend();
      
      debug('User info processed successfully');
    } catch (error) {
      errorReporter.captureError(
        new AppError('Error processing user info', ErrorCode.VALIDATION_ERROR, error)
      );
    }
  }
  
  /**
   * Save user info to extension storage
   */
  private saveUserInfoToStorage(userData: any): void {
    try {
      // Save to chrome.storage
      chrome.storage.local.set({ [this.storageKey]: userData });
      debug('User info saved to storage');
    } catch (error) {
      errorReporter.captureError(
        new AppError('Error saving user info to storage', ErrorCode.STORAGE_ERROR, error)
      );
    }
  }
  
  /**
   * Get user info from storage
   */
  private async getUserInfoFromStorage(): Promise<any> {
    try {
      return new Promise((resolve) => {
        chrome.storage.local.get([this.storageKey], (result) => {
          if (result && result[this.storageKey]) {
            debug('Retrieved user info from storage');
            resolve(result[this.storageKey]);
          } else {
            debug('No user info found in storage');
            resolve(null);
          }
        });
      });
    } catch (error) {
      errorReporter.captureError(
        new AppError('Error getting user info from storage', ErrorCode.STORAGE_ERROR, error)
      );
      return null;
    }
  }
  
  /**
   * Get the current user info
   */
  public getUserInfo(): UserMetadata | null {
    return this.userInfo;
  }
  
  /**
   * Get user ID
   */
  public getUserId(): string | null {
    return this.userInfo?.id || null;
  }
  
  /**
   * Save user metadata to backend
   */
  private saveUserMetadataToBackend(): void {
    if (!this.userInfo) return;
    
    try {
      userApi.saveUserMetadata({
        email: this.userInfo.email,
        name: this.userInfo.name,
        phone_number: this.userInfo.phone_number || undefined,
        org_name: this.userInfo.org_name || undefined,
        picture: this.userInfo.picture || undefined
      })
      .then(() => {
        debug('User metadata saved to backend');
      })
      .catch(error => {
        errorReporter.captureError(
          new AppError('Error saving user metadata', ErrorCode.API_ERROR, error)
        );
      });
    } catch (error) {
      errorReporter.captureError(
        new AppError('Error preparing user metadata save', ErrorCode.UNKNOWN_ERROR, error)
      );
    }
  }
  
  /**
   * Force a refresh of the user info
   */
  public refreshUserInfo(): void {
    this.fetchedUserInfo = false;
    
    // Clear from storage
    chrome.storage.local.remove([this.storageKey]);
    debug('User info refreshed');
  }
}

export const userProfileService = UserProfileService.getInstance();