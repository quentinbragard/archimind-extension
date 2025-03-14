// src/content/applicationInitializer.ts

import { statsService } from '@/services/analytics/StatsService';
import { templateService } from '@/services/templates/TemplateService';
import { notificationService } from '@/services/notifications/NotificationService';
import { userInfoService } from '@/services/user/UserInfoService'; 
import { componentInjector } from '@/core/utils/componentInjector';
import { StatsPanel } from '@/components/StatsPanel';
import MainButton from '@/components/MainButton';
import { authService } from '@/services/auth/AuthService';
import { SettingsDialog } from '@/components/SettingsDialog';
import React from 'react';
import { networkRequestMonitor } from '@/core/network/NetworkRequestMonitor';
import { messageService } from '@/services/MessageService';
import { UrlChangeListener } from '@/services/UrlChangeListener';
import { chatService } from '@/services/chat/ChatService';
import { emitEvent, AppEvent } from '@/core/events/events';
import { toast } from "sonner";

/**
 * Main application initializer
 * Coordinates the initialization of all services and components
 */
export class AppInitializer {
  private static instance: AppInitializer;
  private isInitialized: boolean = false;
  private isAuthenticating: boolean = false;
  private settingsOpen: boolean = false;
  private resizeHandler: (() => void) | null = null;
  private mutationObserver: MutationObserver | null = null;
  private statsPanelUpdateTimeout: number | null = null;
  
  private constructor() {}
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): AppInitializer {
    if (!AppInitializer.instance) {
      AppInitializer.instance = new AppInitializer();
    }
    return AppInitializer.instance;
  }
  
  /**
   * Initialize the application
   */
  public async initialize(): Promise<boolean> {
    // Skip if already initialized
    if (this.isInitialized) {
      return true;
    }
    
    // Skip if we're not on ChatGPT
    if (!this.isChatGPTSite()) {
      return false;
    }
    
    try {
      console.log('🚀 Initializing Archimind application...');
      
      // 1. Authenticate user
      const isAuthenticated = await this.authenticateUser();
      if (!isAuthenticated) {
        console.error('❌ User authentication failed');
        return false;
      }
      
      // 2. Initialize core services
      await this.initializeCoreServices();
      
      // 3. Set up URL change monitoring
      this.setupUrlChangeMonitoring();
      
      // 4. Set up message listeners
      this.setupMessageListeners();
      
      // 5. Inject UI components
      this.injectUIComponents();
      
      // 6. Initialize secondary services
      await this.initializeSecondaryServices();
      
      this.isInitialized = true;
      console.log('✅ Archimind application initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Error initializing application:', error);
      return false;
    }
  }

  /**
   * Initialize core services
   */
  private async initializeCoreServices(): Promise<void> {
    console.log('🔧 Initializing core services...');
    
    // Initialize network monitoring first since other services depend on it
    networkRequestMonitor.initialize();
    
    // Initialize the chat service that will now handle conversations
    await chatService.initialize();
    
    // Initialize message service
    messageService.initialize();
    
    // Set up specific endpoint listeners
    this.setupSpecificEndpointListeners();
    
    console.log('✅ Core services initialized');
  }

  /**
   * Set up listeners for specific API endpoints
   */
  private setupSpecificEndpointListeners(): void {
    
    // Add listener for specific conversation endpoint
    const specificConversationRegex = '/backend-api/conversation/[a-zA-Z0-9-]+$';
    networkRequestMonitor.addListener(specificConversationRegex, (data) => {
      chatService.getConversation(data);
      chatService.setCurrentConversationId(data);
      console.log('🔑🔑 specificConversation', data);
    });
    
    // Also listen for the specific event type
    networkRequestMonitor.addListener('specificConversation', (data) => {
      chatService.getConversation(data);
      chatService.setCurrentConversationId(data);
      console.log('🔑 specificConversation', data);
    });
    
    console.log('✅ Specific endpoint listeners set up');
  }

  /**
   * Set up URL change monitoring
   */
  private setupUrlChangeMonitoring(): void {
    // Create URL change listener
    const urlListener = new UrlChangeListener({
      onUrlChange: (newUrl) => {
        console.log(`🔍 URL changed: ${newUrl}`);
        
        // Extract chatId from URL
        const chatId = UrlChangeListener.extractChatIdFromUrl(newUrl);
        
        // If a valid chat ID is found, update the current conversation
        if (chatId) {
          chatService.setCurrentConversationId(chatId);
          
          // Emit an event for other components to react to
          emitEvent(AppEvent.CHAT_CONVERSATION_CHANGED, {
            conversationId: chatId
          });
        }
      }
    });
    
    // Start listening for URL changes
    urlListener.startListening();
  }
  
  /**
   * Initialize secondary services
   */
  private async initializeSecondaryServices(): Promise<void> {
    console.log('🔧 Initializing secondary services...');
    
    // Initialize template service
    templateService.initialize();
    
    // Initialize notification service
    notificationService.initialize();
    
    // Initialize user info service
    userInfoService.initialize();
    
    // Initialize statistics service
    statsService.initialize();
    
    console.log('✅ Secondary services initialized');
  }
  
  /**
   * Inject UI components
   */
  private injectUIComponents(): void {
    console.log('🔧 Injecting UI components...');
    
    // Inject the Stats Panel
    componentInjector.inject(StatsPanel, {}, {
      id: 'archimind-stats-panel',
      position: {
        type: 'fixed',
        top: '5px',
        left: '50%',
        zIndex: '10000'
      },
      containerStyle: {
        transform: 'translateX(-50%)' // Center horizontally
      }
    });
    
    // Inject the Main Button
    componentInjector.inject(MainButton, {
      onSettingsClick: () => this.openSettings(),
      onSaveClick: () => this.saveCurrentConversation()
    }, {
      id: 'archimind-main-button',
      position: {
        type: 'fixed',
        bottom: '10px',
        right: '75px',
        zIndex: '9999'
      }
    });
    
    // Set up resize listener for responsive positioning
    this.resizeHandler = this.debouncedUpdatePosition.bind(this);
    window.addEventListener('resize', this.resizeHandler);
    
    // Initial position update
    this.updateStatsPanelPosition();
    
    // Setup a lighter MutationObserver for layout changes
    this.setupLightMutationObserver();
    
    console.log('✅ UI components injected');
  }
  
  /**
   * Clean up all resources
   */
  public cleanup(): void {
    if (!this.isInitialized) return;
    
    console.log('🧹 Cleaning up Archimind application...');
    
    // Clear any pending timeouts
    if (this.statsPanelUpdateTimeout !== null) {
      clearTimeout(this.statsPanelUpdateTimeout);
      this.statsPanelUpdateTimeout = null;
    }
    
    // Disconnect mutation observer
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }
    
    // Clean up services
    statsService.cleanup();
    notificationService.cleanup();
    messageService.cleanup();
    networkRequestMonitor.cleanup();
    chatService.cleanup();
    
    // Remove UI components
    componentInjector.removeAll();
    
    // Remove event listeners
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
      this.resizeHandler = null;
    }
    
    // Remove event listener for network intercept
    document.removeEventListener('archimind-network-intercept', 
      this.handleNetworkIntercept as EventListener);
    
    this.isInitialized = false;
    console.log('✅ Archimind application cleaned up');
  }
  
  /**
   * Check if we're on ChatGPT
   */
  private isChatGPTSite(): boolean {
    return window.location.hostname.includes('chatgpt.com') || 
           window.location.hostname.includes('chat.openai.com');
  }
  
  /**
   * Authenticate the user
   */
  private async authenticateUser(): Promise<boolean> {
    console.log('🔑 Authenticating user...');
    if (this.isAuthenticating) {
      return new Promise((resolve) => {
        // Poll until authentication is complete
        const checkInterval = setInterval(() => {
          if (!this.isAuthenticating) {
            clearInterval(checkInterval);
            resolve(this.isAuthenticated());
          }
        }, 100);
      });
    }
    
    this.isAuthenticating = true;
    console.log('🔑 this.isAuthenticating', this.isAuthenticating);
    
    try {
      // Check for user ID in storage
      const userId = await authService.getUserId();
      console.log('🔑 userId', userId);
      if (!userId) {
        this.isAuthenticating = false;
        return false;
      }
      
      this.isAuthenticating = false;
      return true;
    } catch (error) {
      console.error('❌ Error authenticating user:', error);
      this.isAuthenticating = false;
      return false;
    }
  }
  
  /**
   * Check if user is authenticated
   */
  private isAuthenticated(): boolean {
    // For simplicity, check if userId exists in local storage
    return !!localStorage.getItem('userId');
  }
  
  /**
   * Handle network intercept events
   */
  private handleNetworkIntercept(event: CustomEvent): void {
    // Stub for future functionality
  }
  
  /**
   * Debounced version of updateStatsPanelPosition
   */
  private debouncedUpdatePosition(): void {
    // Cancel any pending update
    if (this.statsPanelUpdateTimeout !== null) {
      clearTimeout(this.statsPanelUpdateTimeout);
    }
    
    // Schedule new update
    this.statsPanelUpdateTimeout = window.setTimeout(() => {
      this.updateStatsPanelPosition();
      this.statsPanelUpdateTimeout = null;
    }, 100);
  }
  
  /**
   * Update the position of the stats panel
   */
  private updateStatsPanelPosition(): void {
    // Find the composer parent element
    const composerDiv = document.querySelector('div[role="presentation"].composer-parent');
    if (!composerDiv) return;
    
    // Get the center position of the composer div
    const composerRect = composerDiv.getBoundingClientRect();
    const centerX = composerRect.x + (composerRect.width / 2);
    
    // Get the stats panel container
    const statsPanel = document.getElementById('archimind-stats-panel-container');
    if (!statsPanel) return;
    
    // Update the left position to keep it centered
    statsPanel.style.left = `${centerX}px`;
  }
  
  /**
   * Setup a lightweight MutationObserver for layout changes
   */
  private setupLightMutationObserver(): void {
    // Clear any existing observer
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }
    
    // Create a new observer
    this.mutationObserver = new MutationObserver((mutations) => {
      // Check if any mutations affect layout
      const layoutChanged = mutations.some(mutation => {
        // Only care about changes to class, style, or width attributes
        if (mutation.type === 'attributes') {
          const attrName = mutation.attributeName;
          return attrName === 'class' || attrName === 'style' || attrName === 'width';
        }
        return false;
      });
      
      // Only update if layout changed
      if (layoutChanged) {
        this.debouncedUpdatePosition();
      }
    });
    
    // Start observing the main area
    const mainArea = document.querySelector('main');
    if (mainArea) {
      this.mutationObserver.observe(mainArea, {
        childList: false,
        subtree: false,
        attributes: true,
        attributeFilter: ['class', 'style', 'width']
      });
    }
  }
  
  /**
   * Open settings dialog
   */
  private openSettings(): void {
    if (this.settingsOpen) return;
    
    this.settingsOpen = true;
    
    // Inject the Settings Dialog
    componentInjector.inject(
      (props) => React.createElement(SettingsDialog, {
        open: true,
        onOpenChange: (open) => {
          if (!open) {
            this.settingsOpen = false;
            // Remove dialog when closed
            componentInjector.remove('archimind-settings-dialog');
          }
        },
        ...props
      }),
      {},
      { id: 'archimind-settings-dialog' }
    );
  }
  
  /**
   * Save current conversation
   */
  private saveCurrentConversation(): void {
    // Get current chat ID from the chat service instead of conversationHandler
    const chatId = chatService.getCurrentConversationId();
    if (!chatId) {
      // Use toast instead of custom event for more consistent UI
      toast.warning('No Active Conversation', {
        description: 'Please select a conversation first.'
      });
      return;
    }
    
    // Use the service to save conversation data
    try {
      // The chatService already has the conversation ID set, and messages are 
      // saved automatically. We can add special flags or forced saves here if needed.
      
      // Show success toast
      toast.success('Conversation Saved', {
        description: 'Your conversation has been saved successfully.'
      });
    } catch (error) {
      toast.error('Error Saving Conversation', {
        description: 'There was a problem saving your conversation.'
      });
    }
  }
  
  /**
   * Set up message listeners for internal communication
   */
  private setupMessageListeners(): void {
    // Listen for Chrome extension messages
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'applySettings') {
        // Process settings asynchronously
        setTimeout(() => {
          this.applySettings(message.settings);
          sendResponse({ success: true });
        }, 0);
        return true; // Keep channel open for async response
      } 
      else if (message.action === 'reinitialize') {
        // Reinitialize the application
        this.cleanup();
        this.initialize().then(success => {
          sendResponse({ success });
        });
        return true; // Keep channel open for async response
      }
    });
  }
  
  /**
   * Apply settings changes
   */
  private applySettings(settings: any): void {
    if (!settings) return;
    
    if (settings.statsVisible !== undefined) {
      const statsPanel = document.getElementById('archimind-stats-panel');
      if (statsPanel) {
        statsPanel.style.display = settings.statsVisible ? 'block' : 'none';
      }
    }
    
    // Apply other settings as needed
  }
}

// Export a singleton instance
export const appInitializer = AppInitializer.getInstance();

// Default export for module imports
export default {
  initialize: () => appInitializer.initialize(),
  cleanup: () => appInitializer.cleanup()
};