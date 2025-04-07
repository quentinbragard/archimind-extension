// src/core/utils/i18n.ts

/**
 * Safely gets an internationalized string with proper fallbacks
 * 
 * @param key The i18n message key or default text
 * @param substitutions Optional substitutions for placeholders
 * @param defaultValue Optional default value if key doesn't exist
 * @returns The localized string or fallback
 */
export function getMessage(key: string, substitutions?: string | string[], defaultValue?: string): string {
    // If key is empty, return default value or empty string
    if (!key) return defaultValue || '';
    
    try {
      // Check if chrome.i18n is available
      if (typeof chrome !== 'undefined' && chrome.i18n && chrome.i18n.getMessage) {
        // Try to get the message from chrome.i18n
        const message = chrome.i18n.getMessage(key, substitutions);
        
        // If message exists, return it
        if (message) {
          return message;
        }
      }
      
      // Fallback: If the key looks like an i18n key (no spaces, proper casing), return default or key
      if (!/\s/.test(key) && /^[a-zA-Z0-9._]+$/.test(key)) {
        return defaultValue || key;
      }
      
      // If the key looks like regular text (has spaces), treat it as the default text
      return key;
    } catch (error) {
      // Something went wrong with chrome.i18n, return the key or default
      console.warn(`Error getting i18n message for key "${key}":`, error);
      return defaultValue || key;
    }
  }
  
  /**
   * Checks if the i18n API is available
   */
  export function isI18nAvailable(): boolean {
    return typeof chrome !== 'undefined' && 
           !!chrome.i18n && 
           typeof chrome.i18n.getMessage === 'function';
  }
  
  /**
   * Gets the current UI language
   */
  export function getCurrentLanguage(): string {
    if (isI18nAvailable() && chrome.i18n.getUILanguage) {
      const language = chrome.i18n.getUILanguage();
      console.log('language', language);
      if (language.startsWith("en-")) {
        return "en";
      }
      if (language.startsWith("fr-")) {
        return "fr";
      }
      return language;
    }
    
    // Fallback to browser language or English
    return navigator.language || 'en';
  }