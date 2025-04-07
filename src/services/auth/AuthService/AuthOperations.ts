// src/services/auth/AuthService/AuthOperations.ts
import { AuthUser, AuthToken } from '@/types';
import { emitEvent, AppEvent } from '@/core/events/events';

export class AuthOperations {
  /**
   * Get user data from storage
   */
  public static async getUserFromStorage(): Promise<AuthUser | null> {
    return new Promise((resolve) => {
      chrome.storage.local.get(['user'], (result) => {
        resolve(result.user || null);
      });
    });
  }
  
  /**
   * Sign in using email/password
   */
  public static async signInWithEmail(email: string, password: string): Promise<{
    success: boolean;
    user?: AuthUser;
    error?: string;
    session?: AuthToken;
  }> {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(
        { action: "emailSignIn", email, password }, 
        (response) => {
          resolve(response);
        }
      );
    });
  }
  
  /**
   * Sign up with email/password
   */
  public static async signUp(email: string, password: string, name?: string): Promise<{
    success: boolean;
    user?: AuthUser;
    error?: string;
    session?: AuthToken;
  }> {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(
        { action: "signUp", email, password, name }, 
        (response) => {
          resolve(response);
        }
      );
    });
  }
  
  /**
   * Sign in with Google OAuth
   */
  public static async signInWithGoogle(): Promise<{
    success: boolean;
    user?: AuthUser;
    error?: string;
    session?: AuthToken;
  }> {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(
        { action: "googleSignIn" }, 
        (response) => {
          resolve(response);
        }
      );
    });
  }
  
  
  
  /**
   * Sign out the current user
   */
  public static async clearUserData(): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.remove(
        ['access_token', 'refresh_token', 'token_expires_at', 'user', 'userId'], 
        () => {
          emitEvent(AppEvent.AUTH_LOGOUT, undefined);
          resolve();
        }
      );
    });
  }
}