// src/core/events/EventManager.ts

import { eventBus } from './EventBus';
import { AppEvent, EventPayloads } from './events';

/**
 * Centralized event management system to standardize events across the app
 */
class EventManager {
  private chromeMessageHandlers: Map<string, (message: any, sender: any) => void> = new Map();
  private domEventHandlers: Map<string, (event: CustomEvent) => void> = new Map();
  
  /**
   * Initialize event listeners
   */
  public initialize(): void {
    // Set up chrome.runtime.onMessage listener
    chrome.runtime.onMessage.addListener(this.handleChromeMessage);
    
    // Set up DOM event listeners
    document.addEventListener('jaydai:network-intercept', this.handleDomEvent as EventListener);
    
    console.log('EventManager initialized');
  }
  
  /**
   * Clean up event listeners
   */
  public cleanup(): void {
    // Remove chrome message listener
    chrome.runtime.onMessage.removeListener(this.handleChromeMessage);
    
    // Remove DOM event listeners
    document.removeEventListener('jaydai:network-intercept', this.handleDomEvent as EventListener);
    
    console.log('EventManager cleaned up');
  }
  
  /**
   * Emit an event with type safety
   */
  public emit<T extends AppEvent>(event: T, payload: EventPayloads[T]): void {
    // Use the existing eventBus to emit internal events
    eventBus.emit(event, payload);
  }
  
  /**
   * Subscribe to an event with type safety
   * @returns Unsubscribe function
   */
  public on<T extends AppEvent>(event: T, callback: (payload: EventPayloads[T]) => void): () => void {
    return eventBus.on(event, callback);
  }
  
  /**
   * Register a chrome message handler
   * @returns Unsubscribe function
   */
  public onChromeMessage(action: string, handler: (message: any, sender: any) => void): () => void {
    this.chromeMessageHandlers.set(action, handler);
    
    return () => {
      this.chromeMessageHandlers.delete(action);
    };
  }
  
  /**
   * Register a DOM event handler
   * @returns Unsubscribe function
   */
  public onDomEvent(type: string, handler: (event: CustomEvent) => void): () => void {
    this.domEventHandlers.set(type, handler);
    
    return () => {
      this.domEventHandlers.delete(type);
    };
  }
  
  /**
   * Send a message to the background script
   */
  public sendToBackground(action: string, data: any = {}): Promise<any> {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ action, ...data }, (response) => {
        resolve(response);
      });
    });
  }
  
  /**
   * Dispatch a DOM event
   */
  public dispatchDomEvent(type: string, detail: any = {}): void {
    document.dispatchEvent(
      new CustomEvent(type, { detail })
    );
  }
  
  /**
   * Handle chrome runtime messages
   */
  private handleChromeMessage = (message: any, sender: any, sendResponse: any): boolean => {
    if (!message || !message.action) return false;
    
    const handler = this.chromeMessageHandlers.get(message.action);
    
    if (handler) {
      try {
        handler(message, sender);
      } catch (error) {
        console.error(`Error in chrome message handler for ${message.action}:`, error);
      }
      return true; // Keep channel open for async response
    }
    
    return false; // Close the channel
  };
  
  /**
   * Handle DOM events
   */
  private handleDomEvent = (event: CustomEvent): void => {
    if (!event.detail || !event.detail.type) return;
    
    const handler = this.domEventHandlers.get(event.detail.type);
    
    if (handler) {
      try {
        handler(event);
      } catch (error) {
        console.error(`Error in DOM event handler for ${event.detail.type}:`, error);
      }
    }
  };
}

// Export a singleton instance
export const eventManager = new EventManager();