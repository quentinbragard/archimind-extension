// src/services/analytics/StatsService.ts
import { AbstractBaseService } from '../BaseService';
import { userApi } from "@/services/api/UserApi";
import { debug } from '@/core/config';
import { errorReporter } from '@/core/errors/ErrorReporter';
import { AppError, ErrorCode } from '@/core/errors/AppError';
import { emitEvent, AppEvent } from '@/core/events/events';
import { 
  UserStatsResponse, 
  WeeklyConversationsResponse, 
  MessageDistributionResponse 
} from '@/types/services/api';

export interface Stats {
  totalChats: number;
  recentChats: number;
  totalMessages: number;
  avgMessagesPerChat: number;
  messagesPerDay: Record<string, number>;
  chatsPerDay: Record<string, number>;  // Add this property
  efficiency?: number;
  tokenUsage: {
    recent: number;
    recentInput: number;
    recentOutput: number;
    total: number;
    totalInput: number;
    totalOutput: number;
  };
  energyUsage: {
    recentWh: number;
    totalWh: number;
    perMessageWh: number;
    equivalent?: string;
  };  
  thinkingTime: {
    total: number;
    average: number;
  };
  modelUsage?: Record<string, {
    count: number;
    inputTokens: number;
    outputTokens: number;
  }>;
}

export interface ChartData {
  labels: string[];
  values: number[];
  colors?: string[];
}

/**
 * Service to manage and update extension usage statistics
 */
export class StatsService extends AbstractBaseService {
  private stats: Stats = {
    totalChats: 0,
    recentChats: 0,
    totalMessages: 0,
    avgMessagesPerChat: 0,
    messagesPerDay: {},
    chatsPerDay: {},  // Add this
    tokenUsage: {
      recent: 0,
      recentInput: 0,
      recentOutput: 0,
      total: 0,
      totalInput: 0,
      totalOutput: 0
    },
    energyUsage: {
      recentWh: 0,
      totalWh: 0,
      perMessageWh: 0
    },
    thinkingTime: {
      total: 0,
      average: 0
    }
  };
  private updateInterval: number | null = null;
  private updateCallbacks: ((stats: Stats) => void)[] = [];
  private lastLoadTime: number = 0;
  private retryCount: number = 0;
  private isLoading: boolean = false;
  private static instance: StatsService;

   private constructor() {
    super();
  }
  
  public static getInstance(): StatsService {
    if (!StatsService.instance) {
      StatsService.instance = new StatsService();
    }
    return StatsService.instance;
  }

  /**
   * Initialize stats tracking
   */
  protected async onInitialize(): Promise<void> {
    debug('Initializing stats service...');
    
    // Listen for relevant events
    this.setupEventListeners();
    
    // Load initial stats
    await this.loadStats();
    
    // Set up more frequent refresh from backend
    this.updateInterval = window.setInterval(() => {
      // Only refresh if it's been at least 10 seconds since the last load
      const now = Date.now();
      if (now - this.lastLoadTime >= 10000) { // 10 seconds instead of 60 seconds
        this.loadStats();
      }
    }, 20000); // Check every 20 seconds
    
    debug('Stats service initialized');
  }
  
  /**
   * Clean up resources
   */
  protected onCleanup(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    
    this.updateCallbacks = [];
    debug('Stats service cleaned up');
  }
  
 /**
 * Set up event listeners for tracking stats
 */
private setupEventListeners(): void {
  // Main network intercept listener
  document.addEventListener('jaydai:network-intercept', this.handleNetworkEvent);
  
  // Listen for message-specific events
  document.addEventListener('jaydai:message-extracted', this.handleMessageExtracted);
  
  // Listen for conversation changes
  document.addEventListener('jaydai:conversation-loaded', this.handleConversationLoaded);
  document.addEventListener('jaydai:conversation-list', this.handleConversationList);
  document.addEventListener('jaydai:conversation-changed', this.handleConversationChanged);
  
  // Listen for internal events from our app
  document.addEventListener(AppEvent.CHAT_MESSAGE_SENT, this.handleChatMessageSent);
  document.addEventListener(AppEvent.CHAT_MESSAGE_RECEIVED, this.handleChatMessageReceived);
  document.addEventListener(AppEvent.CHAT_CONVERSATION_CHANGED, this.handleChatConversationChanged);
}

/**
 * Handle message extracted event
 */
private handleMessageExtracted = (event: CustomEvent): void => {
  const { message } = event.detail;
  if (!message) return;

  try {
    // Different handling based on message role
    if (message.role === 'user') {
      this.trackUserMessageSent(message.content);
    } else if (message.role === 'assistant') {
      this.trackAssistantMessageReceived(message.content, message.thinkingTime);
    }
    
    // Trigger a debounced refresh to eventually sync with server
    this.debounceRefresh();
  } catch (error) {
    debug('Error handling message extracted event:', error);
  }
};

/**
 * Handle conversation loaded event
 */
private handleConversationLoaded = (_event: CustomEvent): void => {
  // When a conversation is loaded, refresh stats
  this.debounceRefresh(500);
};

/**
 * Handle conversation list event
 */
private handleConversationList = (event: CustomEvent): void => {
  const { conversations } = event.detail;
  if (conversations && Array.isArray(conversations)) {
    // Update totalChats based on conversations
    const currentTotalChats = this.stats.totalChats;
    const newTotalChats = conversations.length;
    
    if (newTotalChats !== currentTotalChats) {
      this.stats.totalChats = newTotalChats;
      this.notifyUpdateListeners();
      
      // Also refresh from backend
      this.debounceRefresh();
    }
  }
};

/**
 * Handle conversation changed event
 */
private handleConversationChanged = (_event: CustomEvent): void => {
  // When conversation changes, refresh stats
  this.debounceRefresh(500);
};

/**
 * Handle chat message sent event
 */
private handleChatMessageSent = (event: CustomEvent): void => {
  try {
    const { content } = event.detail;
    if (content) {
      this.trackUserMessageSent(content);
    }
  } catch (error) {
    debug('Error handling chat message sent event:', error);
  }
};

/**
 * Handle chat message received event
 */
private handleChatMessageReceived = (event: CustomEvent): void => {
  try {
    const { content, thinkingTime } = event.detail;
    if (content) {
      this.trackAssistantMessageReceived(content, thinkingTime);
    }
  } catch (error) {
    debug('Error handling chat message received event:', error);
  }
};

/**
 * Handle chat conversation changed event
 */
private handleChatConversationChanged = (_event: CustomEvent): void => {
  // When conversation changes, refresh stats
  this.debounceRefresh(500);
};


  /**
 * Update stats optimistically when a user message is sent
 */
public trackUserMessageSent(messageContent: string): void {
  // Increment message count
  this.stats.totalMessages++;
  
  // Update messages per day
  const today = new Date().toISOString().split('T')[0];
  this.stats.messagesPerDay[today] = (this.stats.messagesPerDay[today] || 0) + 1;
  
  // Estimate token usage
  const estimatedTokens = this.estimateTokens(messageContent);
  this.stats.tokenUsage.totalInput += estimatedTokens;
  this.stats.tokenUsage.recent += estimatedTokens;
  this.stats.tokenUsage.recentInput += estimatedTokens;
  
  // Update energy usage
  const energyUsage = estimatedTokens * 0.0003 / 3_600_000; // convert to kWh
  this.stats.energyUsage.total += energyUsage;
  this.stats.energyUsage.recent += energyUsage;
  
  // Notify listeners of the update
  this.notifyUpdateListeners();
}

/**
 * Update stats optimistically when an assistant message is received
 */
public trackAssistantMessageReceived(messageContent: string, thinkingTime?: number): void {
  // Increment message count
  this.stats.totalMessages++;
  
  // Update messages per day
  const today = new Date().toISOString().split('T')[0];
  this.stats.messagesPerDay[today] = (this.stats.messagesPerDay[today] || 0) + 1;
  
  // Estimate token usage
  const estimatedTokens = this.estimateTokens(messageContent);
  this.stats.tokenUsage.totalOutput += estimatedTokens;
  this.stats.tokenUsage.recent += estimatedTokens;
  this.stats.tokenUsage.recentOutput += estimatedTokens;
  
  // Update energy usage
  const energyUsage = estimatedTokens * 0.0006 / 3_600_000; // convert to kWh
  this.stats.energyUsage.total += energyUsage;
  this.stats.energyUsage.recent += energyUsage;
  
  // Update thinking time if provided
  if (thinkingTime) {
    this.stats.thinkingTime.total += thinkingTime;
    // Recalculate average
    this.stats.thinkingTime.average = 
      this.stats.totalMessages > 0 ? this.stats.thinkingTime.total / this.stats.totalMessages : 0;
  }
  
  // Notify listeners of the update
  this.notifyUpdateListeners();
}

/**
 * Estimate the number of tokens in text
 */
private estimateTokens(text: string): number {
  if (!text) return 0;
  // A rough estimation: ~4 characters per token for English text
  return Math.max(1, Math.ceil(text.length / 4));
}
  
  /**
 * Handle network interception events for stats
 */
private handleNetworkEvent = (event: CustomEvent): void => {
  const { type, data } = event.detail;
  
  if (!data) return;
  
  try {
    switch (type) {
      case 'chatCompletion':
        // Track user message sent - use optimistic tracking
        if (data.requestBody?.messages?.length > 0) {
          // Extract user message content
          const userMessage = this.extractUserMessage(data.requestBody);
          if (userMessage && userMessage.content) {
            this.trackUserMessageSent(userMessage.content);
            
            // Trigger a debounced refresh to eventually sync with server
            this.debounceRefresh();
          }
        }
        break;
        
      case 'assistantResponse':
        // Track assistant response if complete
        if (data.isComplete && data.content) {
          this.trackAssistantMessageReceived(data.content, data.thinkingTime);
          
          // Trigger a debounced refresh to eventually sync with server
          this.debounceRefresh();
        }
        break;
        
      case 'conversationList':
        // When conversation list changes, refresh stats
        this.debounceRefresh();
        break;
        
      case 'specificConversation':
        // When a specific conversation is loaded, refresh stats
        this.debounceRefresh(500); // Shorter delay for conversation loads
        break;
    }
  } catch (error) {
    debug('Error handling stats event:', error);
  }
};

/**
 * Extract user message from chat completion request body
 */
private extractUserMessage(requestBody: any): { id: string, content: string } | null {
  try {
    if (!requestBody || !requestBody.messages) return null;
    
    // Find the user message
    const message = requestBody.messages.find(
      (m: any) => m.author?.role === 'user' || m.role === 'user'
    );
    
    if (!message) return null;
    
    // Extract content
    let content = '';
    if (message.content?.parts) {
      content = message.content.parts.join('\n');
    } else if (typeof message.content === 'string') {
      content = message.content;
    } else if (message.content) {
      content = JSON.stringify(message.content);
    }
    
    return {
      id: message.id || `user-${Date.now()}`,
      content
    };
  } catch (error) {
    debug('Error extracting user message:', error);
    return null;
  }
}

// Add debounce mechanism to prevent too many API calls
private refreshTimeout: number | null = null;
private debounceRefresh(delay: number = 1000): void {
  if (this.refreshTimeout !== null) {
    window.clearTimeout(this.refreshTimeout);
  }
  
  this.refreshTimeout = window.setTimeout(() => {
    this.refreshTimeout = null;
    this.loadStats();
  }, delay);
}

  
  /**
   * Get current stats
   */
  public getStats(): Stats {
    return { ...this.stats };
  }
  
  /**
   * Get chart data for messages per day
   */
  public getMessagesPerDayChart(): ChartData {
    // Sort days chronologically (oldest to newest)
    const sortedDays = Object.keys(this.stats.messagesPerDay)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    
    return {
      labels: sortedDays,
      values: sortedDays.map(day => this.stats.messagesPerDay[day])
    };
  }
  
  /**
   * Get energy usage chart data
   */
  public getEnergyUsageChart(): ChartData {
    return {
      labels: ['Recent', 'Total'],
      values: [this.stats.energyUsage.recent, this.stats.energyUsage.total]
    };
  }
  
  /**
   * Get token usage chart data
   */
  public getTokenUsageChart(): ChartData {
    return {
      labels: ['Input', 'Output'],
      values: [this.stats.tokenUsage.totalInput, this.stats.tokenUsage.totalOutput]
    };
  }
  
  /**
   * Get model usage chart data
   */
  public getModelUsageChart(): ChartData {
    if (!this.stats.modelUsage) {
      return { labels: [], values: [] };
    }
    
    const models = Object.keys(this.stats.modelUsage);
    return {
      labels: models,
      values: models.map(model => this.stats.modelUsage?.[model].count || 0)
    };
  }
  
  /**
   * Manually refresh stats from backend
   */
  public async refreshStats(): Promise<void> {
    return this.loadStats(true);
  }
  
  /**
   * Register for stats updates
   * @returns Cleanup function to unregister
   */
  public onUpdate(callback: (stats: Stats) => void): () => void {
    this.updateCallbacks.push(callback);
    
    // Call immediately with current stats
    callback({ ...this.stats });
    
    // Return cleanup function
    return () => {
      this.updateCallbacks = this.updateCallbacks.filter(cb => cb !== callback);
    };
  }
  
  /**
   * Load stats from backend with improved error handling
   */
  private async loadStats(forceRefresh = false): Promise<void> {
    // Skip if not forced and loaded recently
    if (!forceRefresh && Date.now() - this.lastLoadTime < 60000) {
      return;
    }
    
    // Prevent concurrent loads
    if (this.isLoading) {
      return;
    }
    
    this.isLoading = true;
    
    try {
      debug('Loading stats from backend...');
      const data = await userApi.getUserStats();
      
      if (data) {
        // Map backend data to our Stats interface
        this.stats = {
          ...this.stats,
          totalChats: data.total_chats || 0,
          recentChats: data.recent_chats || 0,
          totalMessages: data.total_messages || 0,
          avgMessagesPerChat: data.avg_messages_per_chat || 0,
          efficiency: data.efficiency,
          tokenUsage: {
            recent: data.token_usage?.recent || 0,
            recentInput: data.token_usage?.recent_input || 0,
            recentOutput: data.token_usage?.recent_output || 0,
            total: data.token_usage?.total || 0,
            totalInput: data.token_usage?.total_input || 0,
            totalOutput: data.token_usage?.total_output || 0
          },
          energyUsage: {
            recentWh: data.energy_usage?.recent_wh || 0,
            totalWh: data.energy_usage?.total_wh || 0,
            perMessageWh: data.energy_usage?.per_message_wh || 0,
            equivalent: data.energy_usage?.equivalent || ""
          },          
          thinkingTime: {
            total: data.thinking_time?.total || 0,
            average: data.thinking_time?.average || 0
          },
          modelUsage: data.model_usage || {}
        };
        
        // If backend provides daily message counts, merge them
        if (data.messages_per_day) {
          this.stats.messagesPerDay = { ...data.messages_per_day };
        }
        
        debug('Stats updated from backend');
        this.lastLoadTime = Date.now();
        this.retryCount = 0; // Reset retry count on success
        this.notifyUpdateListeners();
        
        // Emit event for other components
        emitEvent(AppEvent.STATS_UPDATED, { stats: this.getStats() });
      }
    } catch (error) {
      errorReporter.captureError(
        new AppError('Error loading stats', ErrorCode.API_ERROR, error)
      );
      
      // Implement retry with exponential backoff
      if (this.retryCount < 3) {
        this.retryCount++;
        const delay = Math.pow(2, this.retryCount) * 1000; // 2s, 4s, 8s
        debug(`Will retry loading stats in ${delay/1000}s (attempt ${this.retryCount}/3)`);
        
        setTimeout(() => {
          this.isLoading = false;
          this.loadStats();
        }, delay);
      } else {
        // Use fallback data for initial display if all retries fail
        if (this.lastLoadTime === 0) {
          debug('Using fallback stats data after multiple failed attempts');
          
          // Update with at least some minimal info if we have it
          if (this.stats.totalMessages === 0) {
            const today = new Date().toISOString().split('T')[0];
            this.stats.messagesPerDay[today] = this.stats.messagesPerDay[today] || 0;
            
            this.notifyUpdateListeners();
          }
        }
        
        // Reset retry count for next attempt
        this.retryCount = 0;
      }
    } finally {
      // If we're not planning a retry, mark as not loading
      if (this.retryCount === 0) {
        this.isLoading = false;
      }
    }
  }
  
  /**
   * Notify all update listeners
   */
  private notifyUpdateListeners(): void {
    const statsCopy = { ...this.stats };
    
    this.updateCallbacks.forEach(callback => {
      try {
        callback(statsCopy);
      } catch (error) {
        errorReporter.captureError(
          new AppError('Error in stats update callback', ErrorCode.EXTENSION_ERROR, error)
        );
      }
    });
  }
  
  /**
   * Get weekly conversation statistics
   */
  public async getWeeklyConversations(): Promise<WeeklyConversationsResponse | null> {
    try {
      return await userApi.getWeeklyConversationStats();
    } catch (error) {
      errorReporter.captureError(
        new AppError('Error getting weekly conversation stats', ErrorCode.API_ERROR, error)
      );
      return null;
    }
  }
  
  /**
   * Get message distribution statistics
   */
  public async getMessageDistribution(): Promise<MessageDistributionResponse | null> {
    try {
      return await userApi.getMessageDistribution();
    } catch (error) {
      errorReporter.captureError(
        new AppError('Error getting message distribution', ErrorCode.API_ERROR, error)
      );
      return null;
    }
  }
}



// Don't export a singleton instance here - we'll create it when registering services
// This allows for better testing and dependency injection