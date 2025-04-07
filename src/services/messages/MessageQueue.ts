// src/services/messages/MessageQueue.ts
import { AbstractBaseService } from '../BaseService';
import { Message } from '@/types';
import { debug } from '@/core/config';
import { errorReporter } from '@/core/errors/ErrorReporter';
import { AppError, ErrorCode } from '@/core/errors/AppError';
import { messageApi } from '@/services/api/MessageApi';

/**
 * Service for batching and saving messages
 */
export class MessageQueue extends AbstractBaseService {
  private static instance: MessageQueue;
  private queue: Message[] = [];
  private processing: boolean = false;
  private timer: number | null = null;
  private processed: Set<string> = new Set();
  
  private constructor() {
    super();
  }
  
  public static getInstance(): MessageQueue {
    if (!MessageQueue.instance) {
      MessageQueue.instance = new MessageQueue();
    }
    return MessageQueue.instance;
  }
  
  protected async onInitialize(): Promise<void> {
    debug('Initializing MessageQueue');
    // Use direct event listener
    document.addEventListener('jaydai:queue-message', this.handleQueueMessage);
  }
  
  protected onCleanup(): void {
    document.removeEventListener('jaydai:queue-message', this.handleQueueMessage);
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    debug('MessageQueue cleaned up');
  }
  
  /**
   * Handle message queue event
   */
  private handleQueueMessage = (event: CustomEvent): void => {
    const { message } = event.detail;
    if (message) {
      this.queueMessage(message);
    }
  };
  
  /**
   * Queue a message for saving
   */
  public queueMessage(message: Message): void {
    // Skip if already processed
    if (this.processed.has(message.messageId)) {
      return;
    }
    
    // Add to processed set
    this.processed.add(message.messageId);
    
    // Add to queue
    this.queue.push(message);
    
    // Start processing if not already
    if (!this.processing) {
      this.processQueue();
    }
  }
  
  /**
   * Process the message queue
   */
  private processQueue(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    
    if (this.queue.length === 0) {
      this.processing = false;
      return;
    }
    
    this.processing = true;
    
    // Take a batch of messages
    const batch = this.queue.splice(0, 5);
    
    // Process the batch
    this.saveBatch(batch)
      .finally(() => {
        // Schedule next batch
        this.timer = window.setTimeout(() => this.processQueue(), 100);
      });
  }
  
  /**
   * Save a batch of messages
   */
  private async saveBatch(messages: Message[]): Promise<void> {
    if (messages.length === 0) return;
    
    try {
      // Format messages for API
      const formattedMessages = messages.map(msg => ({
        message_provider_id: msg.messageId,
        chat_provider_id: msg.conversationId,
        content: msg.content,
        role: msg.role,
        parent_message_provider_id: msg.parent_message_provider_id,
        model: msg.model || 'unknown',
        created_at: msg.timestamp
      }));
      
      // Save batch
      await messageApi.saveMessageBatch(formattedMessages);
      debug(`Saved batch of ${messages.length} messages`);
    } catch (error) {
      errorReporter.captureError(
        new AppError('Error saving message batch', ErrorCode.API_ERROR, error)
      );
    }
  }
}

export const messageQueue = MessageQueue.getInstance();