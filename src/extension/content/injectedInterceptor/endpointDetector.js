// src/extension/content/injectedInterceptor/endpointDetector.js
// Utilities for detecting and classifying endpoints

import { ENDPOINTS, EVENTS } from './constants';

/**
 * Mapping from endpoint patterns to event names
 */
const ENDPOINT_TO_EVENT = {
  [ENDPOINTS.USER_INFO]: EVENTS.USER_INFO,
  [ENDPOINTS.CONVERSATIONS_LIST]: EVENTS.CONVERSATIONS_LIST,
  [ENDPOINTS.CHAT_COMPLETION]: EVENTS.CHAT_COMPLETION,
  // SPECIFIC_CONVERSATION is handled separately since it's a RegExp
};

/**
 * Determines the event to dispatch based on a URL
 * @param {string} url - The URL to analyze
 * @returns {string|null} - The event name to dispatch or null if not recognized
 */
export function getEndpointEvent(url) {
  if (!url) return null;
  
  // Extract pathname from full URL or relative path
  const pathname = url.startsWith('http') 
    ? new URL(url).pathname 
    : url.split('?')[0];
  
  // Check against specific conversation pattern (RegExp)
  if (ENDPOINTS.SPECIFIC_CONVERSATION.test(pathname)) {
    return EVENTS.SPECIFIC_CONVERSATION;
  }
  
  // Check against other endpoints (direct string matches)
  if (pathname === ENDPOINTS.USER_INFO) {
    return EVENTS.USER_INFO;
  }
  
  if (pathname.startsWith(ENDPOINTS.CONVERSATIONS_LIST)) {
    return EVENTS.CONVERSATIONS_LIST;
  }
  
  if (pathname.startsWith(ENDPOINTS.CHAT_COMPLETION)) {
    return EVENTS.CHAT_COMPLETION;
  }
  
  return null;
}

/**
 * Extracts request body data from fetch init parameter
 * @param {Object} init - The init parameter from fetch
 * @returns {Object|null} - Parsed body or null if not parseable
 */
export function extractRequestBody(init) {
  if (!init || !init.body) return null;
  
  try {
    const bodyText = typeof init.body === 'string' 
      ? init.body 
      : new TextDecoder().decode(init.body);
        
    if (bodyText.trim().startsWith('{')) {
      return JSON.parse(bodyText);
    }
  } catch (e) {
    // Silent fail on parse errors
    console.error('Error parsing request body:', e);
  }
  
  return null;
}