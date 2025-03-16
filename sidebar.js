// Import modules
import DeepSeekAPI from './lib/api.js';
import MarkdownFormatter from './lib/markdown.js';
import ChatUIManager from './lib/ui.js';
import Config from './lib/config.js';

/**
 * Application initialization
 */
function initApp() {
    // Create API instance
    const api = new DeepSeekAPI();
    
    // Create Markdown formatter
    const markdown = new MarkdownFormatter();
    
    // Create and initialize UI manager
    const ui = new ChatUIManager(api, markdown);
    
    // Log that the application has been initialized
    console.log('DeepSeek Chat Sidebar initialized');
}

// Start the application
initApp();
