// src/extension/content/injectedInterceptor/eventsHandler.js
// Utilities for dispatching events to the extension

import { EVENTS, LEGACY_TYPE_TO_EVENT } from './constants';

/**
 * Dispatches an event to the extension with the appropriate event type
 * @param {string} eventName - The name of the event to dispatch
 * @param {Object} data - The data to include in the event detail
 */
export function dispatchEvent(eventName, data) {
  console.log(`Dispatching event: ${eventName}`, data);
  document.dispatchEvent(new CustomEvent(eventName, {
    detail: { ...data, timestamp: Date.now() }
  }));
}

/**
 * Backward compatibility function for sending events in the old format
 * @param {string} type - The legacy type identifier
 * @param {Object} data - The data to send
 */
export function sendLegacyEvent(type, data) {
  // Find the corresponding event name
  const eventName = LEGACY_TYPE_TO_EVENT[type];
  if (!eventName) {
    console.error(`Unknown event type: ${type}`);
    return;
  }

  // Dispatch the event with the same format as before for backward compatibility
  document.dispatchEvent(new CustomEvent(eventName, {
    detail: { type, data, timestamp: Date.now() }
  }));
  
  // For conversation list, also dispatch the legacy 'jaydai:network-intercept' event
  if (type === 'conversationList') {
    document.dispatchEvent(new CustomEvent('jaydai:network-intercept', {
      detail: { type, data, timestamp: Date.now() }
    }));
  }
}

/**
 * Sends a notification that the interceptor has been successfully injected
 */
export function sendInjectionComplete() {
  dispatchEvent(EVENTS.INJECTION_COMPLETE, { status: 'success' });
}