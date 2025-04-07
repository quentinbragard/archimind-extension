// src/extension/content/ContentScript.ts

import { errorReporter } from '@/core/errors/ErrorReporter';
import { AppError } from '@/core/errors/AppError';
import { emitEvent, AppEvent } from '@/core/events/events';
import { config, debug } from '@/core/config';
import { componentInjector } from '@/core/utils/componentInjector';
import Main from '@/components/Main';

/**
 * Main content script class that manages extension functionality
 */
export class ContentScript {
  private static instance: ContentScript;
  private isInitialized: boolean = false;
  
  private constructor() {}
  
  public static getInstance(): ContentScript {
    if (!ContentScript.instance) {
      ContentScript.instance = new ContentScript();
    }
    return ContentScript.instance;
  }
  
  /**
   * Initialize the content script
   */
  public async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }
    
    // Skip if not on supported site
    if (!this.isSupportedSite()) {
      return false;
    }
    
    try {
      debug('Initializing content script...');
      
      // Inject UI components
      this.injectUIComponents();
      
      // Mark as initialized
      this.isInitialized = true;
      
      // Emit initialization event
      emitEvent(AppEvent.EXTENSION_INITIALIZED, {
        version: config.version
      });
      
      debug('Content script initialized successfully');
      return true;
    } catch (error) {
      const appError = AppError.from(error, 'Failed to initialize content script');
      errorReporter.captureError(appError);
      
      // Emit error event
      emitEvent(AppEvent.EXTENSION_ERROR, {
        message: appError.message,
        stack: appError.stack
      });
      
      return false;
    }
  }
  
  /**
   * Check if the current site is supported
   */
  private isSupportedSite(): boolean {
    return window.location.hostname.includes('chatgpt.com') || 
           window.location.hostname.includes('chat.openai.com');
  }
  
  /**
   * Inject UI components
   */
  private injectUIComponents(): void {
    // Inject main button
    componentInjector.inject(Main, {}, {
      id: 'jaydai-root',
      position: {
        type: 'fixed',
        zIndex: '9999'
      }
    });
  }
  
  
  /**
   * Clean up resources
   */
  public cleanup(): void {
    if (!this.isInitialized) {
      return;
    }
    
    // Remove UI components
    componentInjector.removeAll();
    
    this.isInitialized = false;
    debug('Content script cleaned up');
  }
}

// Export singleton instance
export const contentScript = ContentScript.getInstance();

// Default export for module imports
export default {
  initialize: () => contentScript.initialize(),
  cleanup: () => contentScript.cleanup()
};