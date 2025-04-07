// src/extension/content/injectedInterceptor/fetchInterceptor.js
// Core fetch override functionality

import { getEndpointEvent } from './endpointDetector';
import { extractRequestBody } from './endpointDetector';
import { dispatchEvent, sendLegacyEvent } from './eventsHandler';
import { processStreamingResponse } from './streamProcessor';
import { EVENTS } from './constants';

/**
 * Store the original fetch method
 */
let originalFetch = null;

/**
 * Initialize the fetch interceptor by overriding the global fetch method
 */
export function initFetchInterceptor() {
  // Store original fetch method
  originalFetch = window.fetch;
  
  // Override fetch to intercept network requests
  window.fetch = async function(input, init) {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    const eventName = getEndpointEvent(url);
    
    // Skip irrelevant endpoints
    if (!eventName) {
      return originalFetch.apply(this, arguments);
    }
    
    // Extract request body
    const requestBody = extractRequestBody(init);
    
    // Log parent message ID if present (for debugging)
    if (requestBody?.parent_message_provider_id) {
      console.log('🔗 Parent message ID detected:', requestBody.parent_message_provider_id);
    }
    
    // Call original fetch
    const response = await originalFetch.apply(this, arguments);
    
    // Skip non-successful responses
    if (!response.ok) return response;
    
    try {
      const isStreaming = response.headers.get('content-type')?.includes('text/event-stream') || false;
      
      if (eventName === EVENTS.CHAT_COMPLETION) {
        // Dispatch chat completion event
        dispatchEvent(EVENTS.CHAT_COMPLETION, { requestBody });
        
        // Also send legacy event for backward compatibility
        sendLegacyEvent('chatCompletion', { requestBody });
        
        // Process streaming responses
        if (isStreaming && requestBody?.messages?.[0]?.author?.role === "user") {
          processStreamingResponse(response, requestBody);
        }
      } 
      else if (!isStreaming) {
        // For non-streaming endpoints, clone and process response
        const responseData = await response.clone().json().catch(() => null);
        if (responseData) {
          // Dispatch specialized event
          dispatchEvent(eventName, {
            url,
            requestBody,
            responseBody: responseData,
            method: init?.method || 'GET'
          });
          
          // For backward compatibility, also send legacy event format
          // This allows services to gradually migrate to the new event system
          const legacyType = eventName === EVENTS.USER_INFO ? 'userInfo' :
                            eventName === EVENTS.CONVERSATIONS_LIST ? 'conversationList' :
                            eventName === EVENTS.SPECIFIC_CONVERSATION ? 'specificConversation' : null;
                            
          if (legacyType) {
            sendLegacyEvent(legacyType, {
              url,
              requestBody,
              responseBody: responseData,
              method: init?.method || 'GET'
            });
          }
        }
      }
    } catch (error) {
      console.error('Error in fetch interceptor:', error);
    }
    
    return response;
  };
}

/**
 * Restore the original fetch method
 */
export function restoreFetch() {
  if (originalFetch) {
    window.fetch = originalFetch;
    originalFetch = null;
  }
}