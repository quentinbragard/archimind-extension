// src/extension/content/injectedInterceptor/constants.js
// Define all constants used across the interceptor system

/**
 * API Endpoints of interest for interception
 * These are the endpoints we want to monitor and capture data from
 */
export const ENDPOINTS = {
    USER_INFO: '/backend-api/me',
    CONVERSATIONS_LIST: '/backend-api/conversations',
    CHAT_COMPLETION: '/backend-api/conversation',
    SPECIFIC_CONVERSATION: /\/backend-api\/conversation\/([a-f0-9-]+)$/
  };
  
  /**
   * Event names used for communication - using specific events for each data type
   */
  export const EVENTS = {
    USER_INFO: 'jaydai:user-info',
    CONVERSATIONS_LIST: 'jaydai:conversation-list',
    SPECIFIC_CONVERSATION: 'jaydai:specific-conversation',
    CHAT_COMPLETION: 'jaydai:chat-completion',
    ASSISTANT_RESPONSE: 'jaydai:assistant-response',
    MESSAGE_EXTRACTED: 'jaydai:message-extracted',
    CONVERSATION_LOADED: 'jaydai:conversation-loaded',
    CONVERSATION_CHANGED: 'jaydai:conversation-changed',
    QUEUE_MESSAGE: 'jaydai:queue-message',
    NOTIFICATION_COUNT_CHANGED: 'jaydai:notification-count-changed',
    OPEN_NOTIFICATIONS: 'jaydai:open-notifications',
    TOGGLE_PANEL: 'jaydai:toggle-panel',
    SHOW_AUTH_MODAL: 'jaydai:show-auth-modal',
    AUTH_ERROR: 'jaydai:auth-error',
    OPEN_SETTINGS: 'jaydai:open-settings',
    OPEN_TEMPLATES: 'jaydai:open-templates',
    INJECTION_COMPLETE: 'jaydai:injection-complete'
  };
  
  /**
   * Legacy backward-compatibility mapping 
   * This maps the old data types to their corresponding event names
   */
  export const LEGACY_TYPE_TO_EVENT = {
    'userInfo': EVENTS.USER_INFO,
    'conversationList': EVENTS.CONVERSATIONS_LIST,
    'specificConversation': EVENTS.SPECIFIC_CONVERSATION,
    'chatCompletion': EVENTS.CHAT_COMPLETION,
    'assistantResponse': EVENTS.ASSISTANT_RESPONSE,
    'injectionComplete': EVENTS.INJECTION_COMPLETE
  };