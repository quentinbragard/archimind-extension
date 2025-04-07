// src/api/MessageApi.ts - Updated interface
import { apiClient } from './ApiClient';

export interface SaveMessageParams {
  message_provider_id: string;
  content: string;
  role: string;
  chat_provider_id: string;
  model?: string;
  created_at?: number;
  parent_message_provider_id?: string; // Added parent_message_provider_id
}

export interface SaveChatParams {
  chat_provider_id: string;
  title: string;
  provider_name?: string;
}

export class MessageApi {
  /**
   * Save a batch of messages in one operation
   */
  async saveMessageBatch(messages: SaveMessageParams[]): Promise<any> {
    console.log('saveMessageBatch', messages);
    return apiClient.request('/save/batch/message', {
      method: 'POST',
      body: JSON.stringify({
        messages: messages
      })
    });
  }
  
  /**
   * Save a single message
   */
  async saveMessage(message: SaveMessageParams): Promise<any> {
    return apiClient.request('/save/message', {
      method: 'POST',
      body: JSON.stringify(message)
    });
  }
  
  /**
   * Save a batch of chats
   */
  async saveChatBatch(chats: SaveChatParams[]): Promise<any> {
    return apiClient.request('/save/batch/chat', {
      method: 'POST',
      body: JSON.stringify({
        chats: chats
      })
    });
  }
  
  /**
   * Save a single chat
   */
  async saveChat(chat: SaveChatParams): Promise<any> {
    return apiClient.request('/save/chat', {
      method: 'POST',
      body: JSON.stringify({
        chat_provider_id: chat.chat_provider_id,
        title: chat.title,
        provider_name: chat.provider_name || 'ChatGPT'
      })
    });
  }
  
  /**
   * Save a batch of chats and messages
   */
  async saveBatch(batchData: { chats?: SaveChatParams[], messages?: SaveMessageParams[] }): Promise<any> {
    return apiClient.request('/save/batch', {
      method: 'POST',
      body: JSON.stringify(batchData)
    });
  }
}

export const messageApi = new MessageApi();