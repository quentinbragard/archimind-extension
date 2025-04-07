/**
 * Custom Events Declaration File
 * This resolves all the errors about document.addEventListener with custom event types
 */

interface ArchimindEventMap {
    'jaydai:network-intercept': CustomEvent<{
        type: string;
        data: any;
      }>;
      
      // Message events
      'jaydai:message-extracted': CustomEvent<{
        message: import('./services/message').Message;
      }>;
      
    'jaydai:queue-message': CustomEvent<{
      message: import('./services/message').Message;
    }>;
    
    // Conversation events
    'jaydai:conversation-loaded': CustomEvent<{
      conversation: import('./services/conversation').Conversation;
      messages: import('./services/message').Message[];
    }>;
    'jaydai:conversation-list': CustomEvent<{
      conversations: import('./services/conversation').Conversation[];
    }>;
    'jaydai:conversation-changed': CustomEvent<{
      conversationId: string;
    }>;
    
    // Notification events
    'jaydai:notification-count-changed': CustomEvent<{
      unreadCount: number;
    }>;
    'jaydai:open-notifications': CustomEvent<void>;
    'jaydai:open-settings': CustomEvent<void>;
    'jaydai:open-templates': CustomEvent<void>;
    
    // Dialog events
    'jaydai:show-auth-modal': CustomEvent<{
      mode: 'signin' | 'signup';
      isSessionExpired?: boolean;
    }>;
    'jaydai:auth-error': CustomEvent<{
      errorCode: string;
    }>;
    'jaydai:placeholder-editor-opened': CustomEvent<void>;
    'jaydai:placeholder-editor-closed': CustomEvent<void>;
  }
  
  // Augment the Document interface to include our custom events
  declare global {
    interface Document {
      addEventListener<K extends keyof ArchimindEventMap>(
        type: K,
        listener: (this: Document, ev: ArchimindEventMap[K]) => any,
        options?: boolean | AddEventListenerOptions
      ): void;
      removeEventListener<K extends keyof ArchimindEventMap>(
        type: K,
        listener: (this: Document, ev: ArchimindEventMap[K]) => any,
        options?: boolean | EventListenerOptions
      ): void;
      dispatchEvent<K extends keyof ArchimindEventMap>(
        event: ArchimindEventMap[K]
      ): boolean;
    }
  }
  
  export {};