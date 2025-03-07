// src/services/chat/ChatInterceptorService.ts
import { messageObserver } from '@/utils/messageObserver';
import { UrlChangeListener } from './UrlChangeListener';
import { MessageEvent } from './types';
import { injectNetworkInterceptor } from '@/content/injectInterceptor';

// Import handlers
import { conversationHandler } from './handlers/ConversationHandler';
import { messageHandler } from './handlers/MessageHandler';

/**
 * Main service to coordinate ChatGPT interception
 */
export class ChatInterceptorService {
  private static instance: ChatInterceptorService;
  private isInitialized: boolean = false;
  private urlListener: UrlChangeListener;
  
  private constructor() {
    // Initialize URL listener
    this.urlListener = new UrlChangeListener({
      onUrlChange: (newUrl) => this.handleUrlChange(newUrl)
    });
  }
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): ChatInterceptorService {
    if (!ChatInterceptorService.instance) {
      ChatInterceptorService.instance = new ChatInterceptorService();
    }
    return ChatInterceptorService.instance;
  }
  
  /**
   * Initialize the ChatGPT interception
   */
  public initialize(): void {
    if (this.isInitialized) return;
    
    // Get initial chat ID from URL
    const chatId = UrlChangeListener.extractChatIdFromUrl(window.location.href);
    conversationHandler.setCurrentChatId(chatId);
    
    // Try to get the title from the DOM
    conversationHandler.updateChatTitleFromDOM();
    
    // Start message observer
    messageObserver.initialize();
    messageObserver.onNewMessage((message) => {
      messageHandler.processMessage({
        type: message.role as 'user' | 'assistant',
        messageId: message.messageId,
        content: message.message,
        timestamp: message.timestamp,
        conversationId: message.providerChatId
      });
    });
    
    // Inject network interceptor into page context
    injectNetworkInterceptor();
    
    // Start URL change listener
    this.urlListener.startListening();
    
    // If we have a valid chat ID, save it to the backend
    if (chatId) {
      conversationHandler.saveCurrentChatToBackend();
    }
    
    this.isInitialized = true;
  }
  
  /**
   * Clean up all resources
   */
  public cleanup(): void {
    if (!this.isInitialized) return;
    
    // Stop URL listener
    this.urlListener.stopListening();
    
    // Clean up message observer
    messageObserver.cleanup();
    
    // Clear processed messages
    messageHandler.clearProcessedMessages();
    
    this.isInitialized = false;
  }
  
  /**
   * Register a listener for new messages
   * @returns Function to remove the listener
   */
  public onMessage(listener: (event: MessageEvent) => void): () => void {
    return messageHandler.onMessage(listener);
  }
  
  /**
   * Get the current chat ID
   */
  public getCurrentChatId(): string | null {
    return conversationHandler.getCurrentChatId();
  }
  
  /**
   * Get the current chat title
   */
  public getChatTitle(): string {
    return conversationHandler.getCurrentChatTitle();
  }
  
  /**
   * Handle URL changes
   */
  private handleUrlChange(newUrl: string): void {
    // Extract chat ID from URL
    const chatId = UrlChangeListener.extractChatIdFromUrl(newUrl);
    
    // Update current chat ID
    conversationHandler.setCurrentChatId(chatId);
    
    // Try to get the title from the DOM
    conversationHandler.updateChatTitleFromDOM();
    
    // If we have a new chat ID, reset the message observer
    if (chatId !== conversationHandler.getCurrentChatId()) {
      messageObserver.cleanup();
      messageObserver.initialize();
    }
    
    // If we have a valid chat ID, save it to the backend
    if (chatId) {
      conversationHandler.saveCurrentChatToBackend();
    }
  }
}

// Export a singleton instance
export const chatInterceptor = ChatInterceptorService.getInstance();