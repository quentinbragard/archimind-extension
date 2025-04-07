import { useState, useCallback, useEffect, useRef } from 'react';
import { Placeholder } from '@/types/prompts/templates';

/**
 * Hook for managing template placeholders and content
 */
export function useTemplatePlaceholders(initialContent: string) {
  const [content, setContent] = useState(initialContent);
  const [placeholders, setPlaceholders] = useState<Placeholder[]>([]);
  const [editorReady, setEditorReady] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  // Extract placeholders from template content
  const extractPlaceholders = useCallback((text: string) => {
    const placeholderRegex = /\[(.*?)\]/g;
    const matches = Array.from(text.matchAll(placeholderRegex));

    const uniqueKeys = new Set<string>();
    const uniquePlaceholders: Placeholder[] = [];

    for (const match of matches) {
      const placeholder = match[0];

      if (uniqueKeys.has(placeholder)) continue;
      uniqueKeys.add(placeholder);

      const existingPlaceholder = placeholders.find((p) => p.key === placeholder);

      uniquePlaceholders.push({
        key: placeholder,
        value: existingPlaceholder ? existingPlaceholder.value : '',
      });
    }

    return uniquePlaceholders;
  }, [placeholders]);

  // Function to highlight placeholders with improved formatting
  const highlightPlaceholders = useCallback((text: string) => {
    return text
      .replace(/\n/g, '<br>')  // Convert newlines to <br> for proper display
      .replace(
        /\[(.*?)\]/g, 
        `<span class="bg-yellow-300 text-yellow-900 font-bold px-1 rounded inline-block my-0.5">${"$&"}</span>`
      );
  }, []);

  // Initialize content and placeholders
  useEffect(() => {
    setContent(initialContent);
    setPlaceholders(extractPlaceholders(initialContent));

    // Initialize editor content
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = highlightPlaceholders(initialContent);
        setEditorReady(true);
      }
    }, 0);
  }, [initialContent, extractPlaceholders, highlightPlaceholders]);

  // Update content when a placeholder value changes
  const updatePlaceholder = useCallback((index: number, value: string) => {
    setPlaceholders(prev => {
      const updated = [...prev];
      updated[index].value = value;
      
      // Create new content with placeholders replaced
      let newContent = initialContent;
      updated.forEach(({ key, value }) => {
        if (value) {
          // Escape special regex characters in the key
          const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          const regex = new RegExp(escapedKey, "g");
          newContent = newContent.replace(regex, value);
        }
      });
      
      setContent(newContent);
      
      // Update the editor display if it's ready
      if (editorReady && editorRef.current) {
        editorRef.current.innerHTML = highlightPlaceholders(newContent);
      }
      
      return updated;
    });
  }, [initialContent, editorReady, highlightPlaceholders]);

  // Handle manual content editing
  useEffect(() => {
    if (!editorReady || !editorRef.current) return;

    const observer = new MutationObserver(() => {
      // Replace <br> back to \n when getting text
      const cleanedContent = editorRef.current?.innerHTML
        .replace(/<br>/g, '\n')
        .replace(/<\/?span[^>]*>/g, '')  // Remove span tags
        .replace(/&nbsp;/g, ' ');  // Replace non-breaking spaces

      setContent(cleanedContent || "");
    });

    observer.observe(editorRef.current, { 
      childList: true, 
      subtree: true, 
      characterData: true 
    });

    return () => observer.disconnect();
  }, [editorReady]);

  return {
    content,
    placeholders,
    editorRef,
    editorReady,
    updatePlaceholder,
    highlightPlaceholders,
    setContent
  };
}

export default useTemplatePlaceholders;