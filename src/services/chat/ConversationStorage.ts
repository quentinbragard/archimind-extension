// src/services/chat/ConversationStorage.ts
import { AbstractBaseService } from '../BaseService';
import { debug } from '@/core/config';
import { errorReporter } from '@/core/errors/ErrorReporter';
import { AppError, ErrorCode } from '@/core/errors/AppError';
import { messageApi } from '@/services/api/MessageApi';
import { Message } from '@/types';

/**
 * Handles saving conversations and messages to the backend
 */
export class ConversationStorage extends AbstractBaseService {
  private static instance: ConversationStorage;
  private savingConversations: Set<string> = new Set();
  private savingMessages: Set<string> = new Set();
  
  private constructor() {
    super();
  }
  
  public static getInstance(): ConversationStorage {
    if (!ConversationStorage.instance) {
      ConversationStorage.instance = new ConversationStorage();
    }
    return ConversationStorage.instance;
  }
  
  protected async onInitialize(): Promise<void> {
    debug('Initializing ConversationStorage');
    
    // Listen for direct conversation-loaded events
    document.addEventListener('jaydai:conversation-loaded', this.handleConversationLoaded);
  }
  
  protected onCleanup(): void {
    document.removeEventListener('jaydai:conversation-loaded', this.handleConversationLoaded);
    debug('ConversationStorage cleaned up');
  }
  
  /**
   * Handle loaded conversation data, saving both conversation and messages
   */
  private handleConversationLoaded = (event: CustomEvent): void => {
    const { conversation, messages } = event.detail;
    if (conversation) {
      // Save the conversation first
      this.saveConversation(conversation.id, conversation.title);
      
      // Then save all the messages if available
      if (messages && Array.isArray(messages) && messages.length > 0) {
        this.saveMessages(conversation.id, messages);
      }
    }
  };
  
  /**
   * Save a conversation to the backend
   */
  public async saveConversation(conversationId: string, title: string): Promise<boolean> {
    // Skip if already saving this conversation
    if (this.savingConversations.has(conversationId)) {
      return false;
    }
    
    this.savingConversations.add(conversationId);
    
    try {
      await messageApi.saveChat({
        chat_provider_id: conversationId,
        title,
        provider_name: 'ChatGPT'
      });
      
      debug(`Saved conversation ${conversationId.substring(0, 8)}...`);
      return true;
    } catch (error) {
      errorReporter.captureError(
        new AppError('Error saving conversation', ErrorCode.API_ERROR, error)
      );
      return false;
    } finally {
      this.savingConversations.delete(conversationId);
    }
  }
  
  /**
   * Save a batch of messages to the backend
   */
  public async saveMessages(conversationId: string, messages: Message[]): Promise<boolean> {
    // Skip if we're already saving messages for this conversation
    if (this.savingMessages.has(conversationId)) {
      return false;
    }
    
    this.savingMessages.add(conversationId);
    
    try {
      // Break messages into batches of 50 to avoid too large requests
      const batchSize = 50;
      for (let i = 0; i < messages.length; i += batchSize) {
        const batch = messages.slice(i, i + batchSize);
        
        // Format messages for the API
        const formattedMessages = batch.map(msg => ({
          message_provider_id: msg.messageId,
          chat_provider_id: conversationId,
          content: msg.content,
          role: msg.role,
          model: msg.model || 'unknown',
          parent_message_provider_id: msg.parent_message_provider_id,
          created_at: msg.timestamp ? Math.floor(msg.timestamp / 1000) : undefined
        }));
        
        // Save the batch
        await messageApi.saveMessageBatch(formattedMessages);
        
        debug(`Saved batch of ${batch.length} messages for conversation ${conversationId.substring(0, 8)}...`);
      }
      
      return true;
    } catch (error) {
      errorReporter.captureError(
        new AppError('Error saving messages', ErrorCode.API_ERROR, error)
      );
      return false;
    } finally {
      this.savingMessages.delete(conversationId);
    }
  }
}

export const conversationStorage = ConversationStorage.getInstance();