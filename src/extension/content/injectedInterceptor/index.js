// src/extension/content/injectedInterceptor/index.js
// Main entry point for the injected interceptor

import { initFetchInterceptor } from './fetchInterceptor';
import { sendInjectionComplete } from './eventsHandler';

/**
 * Self-executing function to initialize the interceptor
 */
(function() {
  try {
    // Initialize the fetch interceptor
    initFetchInterceptor();
    
    // Notify that injection is complete
    sendInjectionComplete();
    
    console.log('✅ Jaydai network interceptor initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing network interceptor:', error);
  }
})();