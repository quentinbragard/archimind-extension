// src/services/auth/AuthService/index.ts
import { AbstractBaseService } from '../../BaseService';
import { AuthState, AuthErrorCode } from '@/types';
import { AuthStateManager } from './AuthStateManager';
import { AuthOperations } from './AuthOperations';
import { AuthNotifications } from './AuthNotifications';
import { TokenService } from '../TokenService';

/**
 * Service for managing authentication state and operations
 */
export class AuthService extends AbstractBaseService {
  private static instance: AuthService | null = null;
  private stateManager: AuthStateManager;
  private tokenService: TokenService;
  
  private constructor(tokenService: TokenService, stateManager?: AuthStateManager) {
    super();
    this.tokenService = tokenService;
    this.stateManager = stateManager || new AuthStateManager();
  }
  
  public static getInstance(tokenService?: TokenService): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService(
        tokenService || TokenService.getInstance()
      );
    }
    return AuthService.instance;
  }
  
  /**
   * Initialize authentication state
   */
  protected async onInitialize(): Promise<void> {
    this.stateManager.updateState({ isLoading: true, error: null });
    
    try {
      // Try to get the auth token, which will refresh it if necessary
      const tokenResponse = await this.tokenService.getAuthToken();
      
      if (!tokenResponse.success) {
        // Not authenticated or token refresh failed
        this.stateManager.updateState({ 
          isAuthenticated: false, 
          isLoading: false,
          error: tokenResponse.error || null,
          user: null
        });
        return;
      }
      
      // Get user data from storage
      const user = await AuthOperations.getUserFromStorage();
      
      this.stateManager.updateState({
        isAuthenticated: true,
        isLoading: false,
        error: null,
        user
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      
      this.stateManager.updateState({
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Authentication error',
        user: null
      });
    }
  }
  
  /**
   * Clean up resources
   */
  protected onCleanup(): void {
    this.stateManager.clearListeners();
  }
  
  /**
   * Check if the user is authenticated
   */
  public isAuthenticated(): boolean {
    return this.stateManager.getState().isAuthenticated;
  }
  
  /**
   * Get the current auth state
   */
  public getAuthState(): AuthState {
    return this.stateManager.getState();
  }
  
  /**
   * Subscribe to auth state changes
   */
  public subscribe(callback: (state: AuthState) => void): () => void {
    return this.stateManager.subscribe(callback);
  }
  
  /**
   * Handle session expired errors
   */
  public handleSessionExpired(): void {
    // Update auth state
    this.stateManager.updateState({
      isAuthenticated: false,
      error: 'Session expired. Please sign in again.',
      user: null
    });
    
    // Clear auth data from storage
    chrome.storage.local.remove(['access_token', 'refresh_token', 'token_expires_at']);
    
    // Show notification
    AuthNotifications.showSessionExpiredNotification();
    
    // Notify listeners
    AuthNotifications.notifyAuthError(
      AuthErrorCode.SESSION_EXPIRED, 
      this.stateManager.getState().error
    );
  }
  
  /**
   * Sign in using email/password
   */
  public async signInWithEmail(email: string, password: string): Promise<boolean> {
    const response = await AuthOperations.signInWithEmail(email, password);
    if (response.success) {
      this.stateManager.updateState({
        isAuthenticated: true,
        user: response.user,
        error: null
      });
      
      // Store session token if provided
      if (response.session) {
        await this.tokenService.storeAuthSession(response.session);
      }
      
      return true;
    } else {
      this.stateManager.updateState({
        isAuthenticated: false,
        error: response.error || 'Sign-in failed'
      });
      return false;
    }
  }
  
  /**
   * Sign up with email/password
   */
  public async signUp(email: string, password: string, name?: string): Promise<boolean> {
    const response = await AuthOperations.signUp(email, password, name);
    
    if (response.success) {
      // Don't set as authenticated since email verification may be required
      if (response.user) {
        this.stateManager.updateState({
          user: response.user,
          error: null
        });
      }
      
      // Store session token if provided
      if (response.session) {
        await this.tokenService.storeAuthSession(response.session);
      }
      
      return true;
    } else {
      this.stateManager.updateState({
        isAuthenticated: false,
        error: response.error || 'Sign-up failed'
      });
      return false;
    }
  }
  
  /**
   * Sign in with Google OAuth
   */
  public async signInWithGoogle(): Promise<boolean> {
    this.stateManager.updateState({ isLoading: true, error: null });
    
    try {
      const response = await AuthOperations.signInWithGoogle();
      
      if (response.success && response.user) {
        this.stateManager.updateState({
          isAuthenticated: true,
          user: response.user,
          isLoading: false,
          error: null
        });
        
        // Store session token if provided
        if (response.session) {
          await this.tokenService.storeAuthSession(response.session);
        }
        
        return true;
      } else {
        this.stateManager.updateState({
          isAuthenticated: false,
          isLoading: false,
          error: response.error || 'Google sign-in failed'
        });
        return false;
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      
      this.stateManager.updateState({
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Google sign-in failed'
      });
      
      return false;
    }
  }
  
  
  /**
   * Sign out the current user
   */
  public async signOut(): Promise<void> {
    await AuthOperations.clearUserData();
    
    this.stateManager.updateState({
      isAuthenticated: false,
      user: null,
      error: null
    });
    
    AuthNotifications.showSignOutConfirmation();
  }
  
  /**
   * Clear any error message in the auth state
   */
  public clearError(): void {
    if (this.stateManager.getState().error) {
      this.stateManager.updateState({ error: null });
    }
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();