// src/services/chat/ConversationManager.ts
import { AbstractBaseService } from '../BaseService';
import { Conversation } from '@/types/services/conversation';
import { debug } from '@/core/config';
import { errorReporter } from '@/core/errors/ErrorReporter';
import { AppError, ErrorCode } from '@/core/errors/AppError';
import { emitEvent, AppEvent } from '@/core/events/events';

/**
 * Manages conversation data and current conversation state
 */
export class ConversationManager extends AbstractBaseService {
  private static instance: ConversationManager;
  private conversations: Map<string, Conversation> = new Map();
  private currentConversationId: string | null = null;
  
  private constructor() {
    super();
  }
  
  public static getInstance(): ConversationManager {
    if (!ConversationManager.instance) {
      ConversationManager.instance = new ConversationManager();
    }
    return ConversationManager.instance;
  }
  
  protected async onInitialize(): Promise<void> {
    debug('Initializing ConversationManager');
    
    // Listen for URL changes to detect conversation ID
    window.addEventListener('popstate', this.checkUrlForConversationId);
    this.checkUrlForConversationId(); // Check current URL
    
    // Listen for conversation data events
    document.addEventListener('archimind:conversation-loaded', this.handleConversationLoaded);
    document.addEventListener('archimind:conversation-list', this.handleConversationList);
  }
  
  protected onCleanup(): void {
    window.removeEventListener('popstate', this.checkUrlForConversationId);
    document.removeEventListener('archimind:conversation-loaded', this.handleConversationLoaded);
    document.removeEventListener('archimind:conversation-list', this.handleConversationList);
    debug('ConversationManager cleaned up');
  }
  
  /**
   * Check URL for conversation ID
   */
  private checkUrlForConversationId = (): void => {
    try {
      const match = window.location.pathname.match(/\/c\/([a-f0-9-]+)/);
      if (match && match[1]) {
        const conversationId = match[1];
        
        // Only update if different from current
        if (conversationId !== this.currentConversationId) {
          debug(`Detected conversation ID from URL: ${conversationId}`);
          this.setCurrentConversationId(conversationId);
        }
      }
    } catch (error) {
      errorReporter.captureError(
        new AppError('Error checking URL for conversation ID', ErrorCode.EXTENSION_ERROR, error)
      );
    }
  };
  
  /**
   * Handle loaded conversation data
   */
  private handleConversationLoaded = (event: CustomEvent): void => {
    const { conversation } = event.detail;
    if (conversation) {
      this.addConversation(conversation);
    }
  };
  
  /**
   * Handle conversation list data
   */
  private handleConversationList = (event: CustomEvent): void => {
    const { conversations } = event.detail;
    if (conversations && Array.isArray(conversations)) {
      conversations.forEach(conversation => {
        this.addConversation(conversation);
      });
    }
  };
  
  /**
   * Get current conversation ID
   */
  public getCurrentConversationId(): string | null {
    return this.currentConversationId;
  }
  
  /**
   * Set current conversation ID
   */
  public setCurrentConversationId(conversationId: string): void {
    if (this.currentConversationId === conversationId) return;
    
    this.currentConversationId = conversationId;
    
    // Emit event for conversation change
    emitEvent(AppEvent.CHAT_CONVERSATION_CHANGED, { conversationId });
  }
  
  /**
   * Add a conversation
   */
  public addConversation(conversation: Conversation): void {
    this.conversations.set(conversation.id, conversation);
  }
  
  /**
   * Get a specific conversation
   */
  public getConversation(conversationId: string): Conversation | undefined {
    return this.conversations.get(conversationId);
  }
  
  /**
   * Get current conversation
   */
  public getCurrentConversation(): Conversation | undefined {
    if (!this.currentConversationId) return undefined;
    return this.getConversation(this.currentConversationId);
  }
  
  /**
   * Get all conversations sorted by most recent
   */
  public getConversations(): Conversation[] {
    return Array.from(this.conversations.values())
      .sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0));
  }
}

export const conversationManager = ConversationManager.getInstance();