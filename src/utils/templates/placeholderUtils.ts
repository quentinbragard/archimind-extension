// src/utils/template/placeholderUtils.ts

/**
 * Placeholder interface
 */
export interface Placeholder {
    key: string;
    value: string;
  }
  
  /**
   * Extract placeholders from a template string
   * @param content Template content to extract placeholders from
   * @param existingPlaceholders Optional existing placeholders to use values from
   * @returns Array of placeholders
   */
  export function extractPlaceholders(content: string, existingPlaceholders: Placeholder[] = []): Placeholder[] {
    // Find all instances of [something] in the text
    const placeholderRegex = /\[(.*?)\]/g;
    const matches = [...content.matchAll(placeholderRegex)];
  
    // Use Set to track unique keys
    const uniqueKeys = new Set<string>();
    const uniquePlaceholders: Placeholder[] = [];
  
    for (const match of matches) {
      const placeholderKey = match[0]; // Full match including brackets: [something]
  
      // Skip duplicates
      if (uniqueKeys.has(placeholderKey)) continue;
      uniqueKeys.add(placeholderKey);
  
      // Look for existing value or use empty string
      const existingPlaceholder = existingPlaceholders.find(p => p.key === placeholderKey);
      const value = existingPlaceholder ? existingPlaceholder.value : '';
  
      uniquePlaceholders.push({ key: placeholderKey, value });
    }
  
    return uniquePlaceholders;
  }
  
  /**
   * Apply placeholder values to a template
   * @param content Original template content
   * @param placeholders Placeholders with values
   * @returns Content with placeholders replaced
   */
  export function applyPlaceholders(content: string, placeholders: Placeholder[]): string {
    let result = content;
    
    // Apply each placeholder's value
    for (const placeholder of placeholders) {
      if (placeholder.value) {
        // Need to escape special regex characters in the key
        const escapedKey = placeholder.key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapedKey, 'g');
        result = result.replace(regex, placeholder.value);
      }
    }
    
    return result;
  }
  
  /**
   * Highlight placeholders in HTML for visual display
   * @param content Content with placeholders
   * @returns HTML with highlighted placeholders
   */
  export function highlightPlaceholders(content: string): string {
    return content
      .replace(/\n/g, '<br>') // Convert newlines to <br> tags
      .replace(
        /\[(.*?)\]/g, 
        `<span class="bg-yellow-300 text-yellow-900 font-bold px-1 rounded inline-block my-0.5">$&</span>`
      );
  }
  
  /**
   * Clean HTML from editor for saving
   * @param html HTML content from contentEditable div
   * @returns Plain text with normalized line breaks
   */
  export function cleanEditorContent(html: string): string {
    return html
      .replace(/<br>/g, '\n')
      .replace(/<\/?span[^>]*>/g, '') // Remove span tags
      .replace(/&nbsp;/g, ' '); // Replace non-breaking spaces
  }
  
  /**
   * Format content for insertion into ChatGPT textarea
   * @param content Content to format
   * @returns Formatted content
   */
  export function formatForInsertion(content: string): string {
    return content
      .replace(/\r\n/g, '\n') // Normalize line breaks
      .replace(/\n{3,}/g, '\n\n') // Limit consecutive newlines
      .trim(); // Remove leading/trailing whitespace
  }
  
  /**
   * Insert content into ChatGPT textarea
   * @param content Content to insert
   * @returns True if successful, false otherwise
   */
  export function insertIntoPromptArea(content: string): boolean {
    try {
      // Find the textarea
      const textarea = document.querySelector('#prompt-textarea');
      if (!textarea) {
        console.error('Could not find the prompt textarea');
        return false;
      }
      
      // Format content
      const formattedContent = formatForInsertion(content);
      
      // Insert content based on element type
      if (textarea instanceof HTMLTextAreaElement) {
        textarea.value = formattedContent;
      } else if (textarea.isContentEditable) {
        textarea.innerHTML = formattedContent;
      } else {
        textarea.textContent = formattedContent;
      }
      
      // Trigger input event to notify any listeners
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      
      // Focus the textarea
      textarea.focus();
      
      // If the textarea supports setting cursor position, place cursor at end
      if ('setSelectionRange' in textarea) {
        (textarea as HTMLTextAreaElement).setSelectionRange(
          formattedContent.length,
          formattedContent.length
        );
      }
      
      return true;
    } catch (error) {
      console.error('Error inserting content:', error);
      return false;
    }
  }