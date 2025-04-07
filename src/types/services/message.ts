export interface Message {
    messageId: string;
    conversationId: string;
    content: string;
    role: 'user' | 'assistant' | 'system' | 'tool';
    model?: string;
    timestamp: number;           // This will store create_time
    parent_message_provider_id?: string;  // New field to track message thread
    thinkingTime?: number;
    // rank property removed
  }

export interface PendingMessage {
    message: Message;
    timestamp: number;
  }