// src/services/messages/MessageManager.ts
import { AbstractBaseService } from '../BaseService';
import { Message } from '@/types';
import { debug } from '@/core/config';
import { emitEvent, AppEvent } from '@/core/events/events';

/**
 * Manages in-memory storage of messages
 */
export class MessageManager extends AbstractBaseService {
  private static instance: MessageManager;
  private messages: Map<string, Map<string, Message>> = new Map();
  
  private constructor() {
    super();
  }
  
  public static getInstance(): MessageManager {
    if (!MessageManager.instance) {
      MessageManager.instance = new MessageManager();
    }
    return MessageManager.instance;
  }
  
  protected async onInitialize(): Promise<void> {
    debug('Initializing MessageManager');
    
    // Listen for messages from various sources - direct event listeners
    document.addEventListener('jaydai:message-extracted', this.handleExtractedMessage);
    document.addEventListener('jaydai:conversation-loaded', this.handleConversationMessages);
  }
  
  protected onCleanup(): void {
    document.removeEventListener('jaydai:message-extracted', this.handleExtractedMessage);
    document.removeEventListener('jaydai:conversation-loaded', this.handleConversationMessages);
    this.messages.clear();
    debug('MessageManager cleaned up');
  }
  
  /**
   * Handle extracted message event
   */
  private handleExtractedMessage = (event: CustomEvent): void => {
    const { message } = event.detail;
    if (message) {
      this.addMessage(message);
      
      // Forward to queue for saving
      document.dispatchEvent(new CustomEvent('jaydai:queue-message', {
        detail: { message }
      }));
      
      // Emit appropriate event based on message role
      if (message.role === 'user') {
        emitEvent(AppEvent.CHAT_MESSAGE_SENT, {
          messageId: message.messageId,
          content: message.content,
          conversationId: message.conversationId
        });
      } else if (message.role === 'assistant') {
        emitEvent(AppEvent.CHAT_MESSAGE_RECEIVED, {
          messageId: message.messageId,
          content: message.content,
          role: message.role,
          conversationId: message.conversationId
        });
      }
    }
  };
  
  /**
   * Handle messages from loaded conversation
   */
  private handleConversationMessages = (event: CustomEvent): void => {
    const { messages } = event.detail;
    if (messages && Array.isArray(messages)) {
      messages.forEach(message => {
        this.addMessage(message);
      });
    }
  };
  
  /**
   * Add a message to the cache
   */
  public addMessage(message: Message): void {
    const { conversationId, messageId } = message;
    
    if (!conversationId || !messageId) return;
    
    // Get or create conversation messages map
    if (!this.messages.has(conversationId)) {
      this.messages.set(conversationId, new Map());
    }
    
    const conversationMessages = this.messages.get(conversationId)!;
    
    // Add message
    conversationMessages.set(messageId, message);
  }
  
  /**
   * Get all messages for a conversation
   */
  public getConversationMessages(conversationId: string): Message[] {
    const messagesMap = this.messages.get(conversationId);
    if (!messagesMap) return [];
    
    return Array.from(messagesMap.values())
      .sort((a, b) => a.timestamp - b.timestamp);
  }
  
  /**
   * Get a specific message
   */
  public getMessage(conversationId: string, messageId: string): Message | null {
    const messagesMap = this.messages.get(conversationId);
    if (!messagesMap) return null;
    
    return messagesMap.get(messageId) || null;
  }
}

export const messageManager = MessageManager.getInstance();