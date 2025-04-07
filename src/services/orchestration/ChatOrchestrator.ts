// src/services/orchestration/ChatOrchestrator.ts
import { AbstractBaseService } from '../BaseService';
import { debug } from '@/core/config';
import { errorReporter } from '@/core/errors/ErrorReporter';
import { AppError, ErrorCode } from '@/core/errors/AppError';
import { Message } from '@/types';

// Service interfaces
interface IConversationManager {
  getCurrentConversationId(): string | null;
  setCurrentConversationId(conversationId: string): void;
}

interface IMessageManager {
  addMessage(message: Message): void;
  getConversationMessages(conversationId: string): Message[];
}

interface IMessageQueue {
  queueMessage(message: Message): void;
}

interface IPendingMessageTracker {
  processPendingMessages(conversationId: string): void;
  addPendingMessage(message: Message): void;
}

/**
 * Orchestrates actions between chat-related services
 */
export class ChatOrchestrator extends AbstractBaseService {
  private static instance: ChatOrchestrator | null = null;
  
  private conversationManager: IConversationManager;
  private messageManager: IMessageManager;
  private messageQueue: IMessageQueue;
  private pendingTracker: IPendingMessageTracker;
  
  /**
   * Private constructor with explicit dependencies
   */
  private constructor(
    conversationManager: IConversationManager, 
    messageManager: IMessageManager,
    messageQueue: IMessageQueue,
    pendingTracker: IPendingMessageTracker
  ) {
    super();
    this.conversationManager = conversationManager;
    this.messageManager = messageManager;
    this.messageQueue = messageQueue;
    this.pendingTracker = pendingTracker;
  }
  
  /**
   * Get instance with explicit dependencies
   */
  public static getInstance(
    conversationManager?: IConversationManager,
    messageManager?: IMessageManager,
    messageQueue?: IMessageQueue,
    pendingTracker?: IPendingMessageTracker
  ): ChatOrchestrator {
    if (!ChatOrchestrator.instance) {
      // If dependencies aren't provided, get the default instances
      const convManager = conversationManager || require('../chat/ConversationManager').conversationManager;
      const msgManager = messageManager || require('../messages/MessageManager').messageManager;
      const msgQueue = messageQueue || require('../messages/MessageQueue').messageQueue;
      const pendTracker = pendingTracker || require('../messages/PendingMessageTracker').pendingMessageTracker;
      
      ChatOrchestrator.instance = new ChatOrchestrator(
        convManager, msgManager, msgQueue, pendTracker
      );
    }
    return ChatOrchestrator.instance;
  }
  
  /**
   * Reset the singleton instance (useful for testing)
   */
  public static resetInstance(): void {
    ChatOrchestrator.instance = null;
  }
  
  protected async onInitialize(): Promise<void> {
    debug('Initializing ChatOrchestrator');
    
    // Listen for network intercept events
    document.addEventListener('jaydai:message-extracted', this.handleMessageExtracted);
    document.addEventListener('jaydai:conversation-changed', this.handleConversationChanged);
  }
  
  protected onCleanup(): void {
    document.removeEventListener('jaydai:message-extracted', this.handleMessageExtracted);
    document.removeEventListener('jaydai:conversation-changed', this.handleConversationChanged);
    debug('ChatOrchestrator cleaned up');
  }
  
  /**
   * Handle extracted message events
   */
  private handleMessageExtracted = (event: CustomEvent): void => {
    try {
      const { message } = event.detail;
      if (!message) return;
      
      this.processMessage(message);
    } catch (error) {
      errorReporter.captureError(
        new AppError('Error handling message extraction', ErrorCode.ORCHESTRATION_ERROR, error)
      );
    }
  };
  
  /**
   * Handle conversation change events
   */
  private handleConversationChanged = (event: CustomEvent): void => {
    try {
      const { conversationId } = event.detail;
      if (!conversationId) return;
      
      this.pendingTracker.processPendingMessages(conversationId);
    } catch (error) {
      errorReporter.captureError(
        new AppError('Error handling conversation change', ErrorCode.ORCHESTRATION_ERROR, error)
      );
    }
  };
  
  /**
   * Process a message
   */
  public processMessage(message: Message): void {
    // Skip messages without a conversation ID
    if (!message.conversationId) {
      this.pendingTracker.addPendingMessage(message);
      return;
    }
    
    // Update current conversation ID if needed
    const currentConversationId = this.conversationManager.getCurrentConversationId();
    if (currentConversationId !== message.conversationId) {
      this.conversationManager.setCurrentConversationId(message.conversationId);
    }
    
    // Add to message manager
    this.messageManager.addMessage(message);
    
    // Queue for saving
    this.messageQueue.queueMessage(message);
  }
}

// Export a function to create the orchestrator with dependencies
export function createChatOrchestrator(
  conversationManager: IConversationManager,
  messageManager: IMessageManager,
  messageQueue: IMessageQueue,
  pendingTracker: IPendingMessageTracker
): ChatOrchestrator {
  return ChatOrchestrator.getInstance(
    conversationManager,
    messageManager,
    messageQueue,
    pendingTracker
  );
}

// For convenience, also export a default instance
import { conversationManager } from '../chat/ConversationManager';
import { messageManager } from '../messages/MessageManager';
import { messageQueue } from '../messages/MessageQueue';
import { pendingMessageTracker } from '../messages/PendingMessageTracker';

export const chatOrchestrator = ChatOrchestrator.getInstance(
  conversationManager,
  messageManager,
  messageQueue,
  pendingMessageTracker
);