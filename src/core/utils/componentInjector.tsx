// src/core/utils/componentInjector.tsx
import { ComponentType } from 'react';
import { createRoot, Root } from 'react-dom/client';

interface ComponentInstance {
  root: Root;
  containerId: string;
  cleanup: () => void;
}

interface InjectOptions {
  id?: string;
  targetSelector?: string;
  position?: {
    type?: 'fixed' | 'absolute' | 'relative';
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
    zIndex?: string;
  };
  containerStyle?: Record<string, string>;
}

/**
 * Manages injection and cleanup of React components in the DOM
 */
class ComponentInjector {
  private instances: Map<string, ComponentInstance> = new Map();
  private stylesInjected: boolean = false;

  /**
   * Injects global styles needed by components
   */
  private injectStyles(): void {
    if (this.stylesInjected) return;
    
    try {
      // First check if styles already exist
      if (document.getElementById('jaydai-styles')) {
        this.stylesInjected = true;
        return;
      }
      
      // Inject stylesheet
      const style = document.createElement('link');
      style.rel = 'stylesheet';
      style.href = chrome.runtime.getURL('assets/content.css');
      style.id = 'jaydai-styles';
      document.head.appendChild(style);
      
      // Add an inline style to ensure shadow piercing for our components
      const inlineStyle = document.createElement('style');
      inlineStyle.textContent = `
        #jaydai-root, #jaydai-root * {
          z-index: 1;
        }
      `;
      inlineStyle.id = 'jaydai-inline-styles';
      document.head.appendChild(inlineStyle);
      
      this.stylesInjected = true;
      console.log('✅ Archimind styles injected');
    } catch (error) {
      console.error('❌ Failed to inject styles:', error);
    }
  }

  /**
   * Creates a container for a component with proper isolation
   */
  private createContainer(id: string, options: InjectOptions): HTMLElement {
    const existingContainer = document.getElementById(id);
    if (existingContainer) return existingContainer;

    // Create main container if it doesn't exist
    let rootContainer = document.getElementById('jaydai-root');
    if (!rootContainer) {
      rootContainer = document.createElement('div');
      rootContainer.id = 'jaydai-root';
      document.body.appendChild(rootContainer);
    }

    // Create component container
    const container = document.createElement('div');
    container.id = id;
    
    // Apply positioning styles based on options
    if (options.position) {
      Object.assign(container.style, {
        position: options.position.type || 'fixed',
        zIndex: options.position.zIndex || '999999',
        ...options.position
      });
    }
    
    // Apply any additional styles
    if (options.containerStyle) {
      Object.assign(container.style, options.containerStyle);
    }
    
    // Append to target element or root container
    const targetElement = options.targetSelector 
      ? document.querySelector(options.targetSelector) 
      : rootContainer;
      
    if (!targetElement) {
      console.warn(`Target element not found: ${options.targetSelector}`);
      rootContainer.appendChild(container);
    } else {
      targetElement.appendChild(container);
    }
    
    return container;
  }

  /**
   * Injects a React component into the DOM
   */
  inject<P extends object>(
    Component: ComponentType<P>,
    props: P,
    options: InjectOptions = {}
  ): string {
    this.injectStyles();
    
    // Create unique ID for this instance
    const id = options.id || `jaydai-${Component.displayName || 'component'}-${Date.now()}`;
    const containerId = `${id}-container`;
    
    // Create or get container
    const container = this.createContainer(containerId, options);
    
    try {
      // Create React root and render component
      const root = createRoot(container);
      root.render(<Component {...props} />);
      
      // Store instance for later cleanup
      const cleanup = () => {
        try {
          root.unmount();
          container.remove();
          this.instances.delete(id);
          console.log(`✅ Cleaned up component: ${id}`);
        } catch (error) {
          console.error(`❌ Error cleaning up component ${id}:`, error);
        }
      };
      
      this.instances.set(id, { root, containerId, cleanup });
      console.log(`✅ Injected component: ${id}`);
      
      return id;
    } catch (error) {
      console.error(`❌ Error injecting component: ${error}`);
      container.remove();
      return '';
    }
  }

  /**
   * Removes a specific component instance
   */
  remove(id: string): boolean {
    const instance = this.instances.get(id);
    if (!instance) {
      console.warn(`Component not found: ${id}`);
      return false;
    }
    
    instance.cleanup();
    return true;
  }

  /**
   * Cleans up all injected components
   */
  removeAll(): void {
    this.instances.forEach(instance => instance.cleanup());
    
    // Also remove styles if they were injected
    if (this.stylesInjected) {
      const styleElement = document.getElementById('jaydai-styles');
      if (styleElement) styleElement.remove();
      
      const inlineStyles = document.getElementById('jaydai-inline-styles');
      if (inlineStyles) inlineStyles.remove();
      
      this.stylesInjected = false;
    }
    
    // Remove root container if it exists
    const rootContainer = document.getElementById('jaydai-root');
    if (rootContainer) rootContainer.remove();
    
    console.log('✅ All components removed');
  }
}

// Export singleton instance
export const componentInjector = new ComponentInjector();
export type { InjectOptions };