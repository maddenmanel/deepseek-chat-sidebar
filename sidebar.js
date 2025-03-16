// 导入模块
import DeepSeekAPI from './lib/api.js';
import MarkdownFormatter from './lib/markdown.js';
import ChatUIManager from './lib/ui.js';
import Config from './lib/config.js';

/**
 * 应用程序初始化
 */
function initApp() {
    // 创建API实例
    const api = new DeepSeekAPI();
    
    // 创建Markdown格式化器
    const markdown = new MarkdownFormatter();
    
    // 创建并初始化UI管理器
    const ui = new ChatUIManager(api, markdown);
    
    // 记录应用程序已初始化
    console.log('DeepSeek Chat Sidebar已初始化');
}

// 启动应用
initApp();
