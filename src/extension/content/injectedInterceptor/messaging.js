/**
 * Messaging functions for communication between the injected script and the extension
 */

/**
 * Send intercepted data to extension
 * @param {string} type - Type of data being sent
 * @param {Object} data - The data payload
 */
export function sendToExtension(type, data) {
    // Special handling for conversation list data
    if (type === 'conversationList') {
      document.dispatchEvent(new CustomEvent('jaydai:conversation-list', {
        detail: { type, data, timestamp: Date.now() }
      }));
    } else {
      // Standard handling for all other data types
      document.dispatchEvent(new CustomEvent('jaydai:network-intercept', {
        detail: { type, data, timestamp: Date.now() }
      }));
    }
  }
  
  /**
   * Notify the extension that the injection is complete
   */
  export function notifyInjectionComplete() {
    sendToExtension('injectionComplete', { status: 'success' });
  }