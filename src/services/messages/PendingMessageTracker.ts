// src/services/messages/PendingMessageTracker.ts
import { AbstractBaseService } from '../BaseService';
import { Message, PendingMessage } from '@/types';
import { debug } from '@/core/config';

/**
 * Tracks messages that don't yet have a conversation ID
 */
export class PendingMessageTracker extends AbstractBaseService {
  private static instance: PendingMessageTracker;
  
  private pendingMessages: PendingMessage[] = [];
  
  private constructor() {
    super();
  }
  
  public static getInstance(): PendingMessageTracker {
    if (!PendingMessageTracker.instance) {
      PendingMessageTracker.instance = new PendingMessageTracker();
    }
    return PendingMessageTracker.instance;
  }
  
  protected async onInitialize(): Promise<void> {
    debug('Initializing PendingMessageTracker');
    document.addEventListener('jaydai:message-extracted', this.handleExtractedMessage);
    document.addEventListener('jaydai:conversation-changed', this.handleConversationChanged);
  }
  
  protected onCleanup(): void {
    document.removeEventListener('jaydai:message-extracted', this.handleExtractedMessage);
    document.removeEventListener('jaydai:conversation-changed', this.handleConversationChanged);
    this.pendingMessages = [];
    debug('PendingMessageTracker cleaned up');
  }
  
  /**
   * Handle extracted message
   */
  private handleExtractedMessage = (event: CustomEvent): void => {
    const { message } = event.detail;
    if (message && !message.conversationId) {
      this.addPendingMessage(message);
    }
  };
  
  /**
   * Handle conversation change
   */
  private handleConversationChanged = (event: CustomEvent): void => {
    const { conversationId } = event.detail;
    if (conversationId) {
      this.processPendingMessages(conversationId);
    }
  };
  
  /**
   * Add a message to pending
   */
  public addPendingMessage(message: Message): void {
    this.pendingMessages.push({
      message,
      timestamp: Date.now()
    });
    
    debug(`Added pending message: ${message.messageId}`);
    this.cleanupOldPendingMessages();
  }
  
  /**
   * Process pending messages for a conversation
   */
  public processPendingMessages(conversationId: string): void {
    if (this.pendingMessages.length === 0) return;
    
    const messagesToProcess = this.pendingMessages.filter(item => 
      !item.message.conversationId || 
      item.message.conversationId === conversationId
    );
    
    if (messagesToProcess.length === 0) return;
    
    debug(`Processing ${messagesToProcess.length} pending messages for conversation: ${conversationId}`);
    
    messagesToProcess.forEach(item => {
      // Update the message with the conversation ID
      const updatedMessage = { ...item.message, conversationId };
      
      // Emit event for the message with updated conversation ID
      document.dispatchEvent(new CustomEvent('jaydai:message-extracted', {
        detail: { message: updatedMessage }
      }));
      
      // Remove from pending
      this.pendingMessages = this.pendingMessages.filter(
        pending => pending.message.messageId !== item.message.messageId
      );
    });
  }
  
  /**
   * Clean up old pending messages
   */
  private cleanupOldPendingMessages(): void {
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    
    const oldCount = this.pendingMessages.length;
    
    this.pendingMessages = this.pendingMessages.filter(item => {
      return now - item.timestamp < fiveMinutes;
    });
    
    const newCount = this.pendingMessages.length;
    
    if (oldCount !== newCount) {
      debug(`Cleaned up ${oldCount - newCount} old pending messages`);
    }
  }
}

export const pendingMessageTracker = PendingMessageTracker.getInstance();