/**
 * UI处理模块
 */
class ChatUIManager {
    /**
     * 构造函数
     * @param {DeepSeekAPI} api - API实例
     * @param {MarkdownFormatter} markdown - Markdown格式化器实例
     */
    constructor(api, markdown) {
        this.api = api;
        this.markdown = markdown;
        this.chatMessages = null;
        this.userInput = null;
        this.sendButton = null;
        this.currentMessageElement = null;
        
        // 确保DOM完全加载后再初始化
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }

    /**
     * 初始化UI组件
     */
    initialize() {
        this.chatMessages = document.getElementById('chatMessages');
        this.userInput = document.getElementById('userInput');
        this.sendButton = document.getElementById('sendButton');
        
        if (!this.chatMessages || !this.userInput || !this.sendButton) {
            console.error('无法找到UI元素');
            return;
        }
        
        this.initEventListeners();
        this.initApiKey();
    }

    /**
     * 初始化事件监听器
     */
    initEventListeners() {
        // 发送按钮点击事件
        this.sendButton.addEventListener('click', () => {
            this.sendMessage();
        });

        // 输入框回车键事件
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // 自动调整输入框高度
        this.userInput.addEventListener('input', () => {
            this.autoResizeTextarea();
        });

        // 为所有复制按钮添加点击事件委托
        this.chatMessages.addEventListener('click', (e) => {
            if (e.target.classList.contains('copy-button')) {
                this.handleCopyClick(e.target);
            }
        });
    }

    /**
     * 自动调整文本区域高度
     */
    autoResizeTextarea() {
        const textarea = this.userInput;
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }

    /**
     * 初始化API密钥
     */
    async initApiKey() {
        await this.api.loadApiKey(() => {
            this.showApiKeyPrompt();
        });
    }

    /**
     * 显示API密钥输入提示
     */
    showApiKeyPrompt() {
        const apiKey = prompt('请输入您的DeepSeek API密钥:');
        if (apiKey) {
            this.api.saveApiKey(apiKey);
        }
    }

    /**
     * 处理复制按钮点击
     * @param {HTMLElement} button - 被点击的按钮
     */
    async handleCopyClick(button) {
        const codeBlock = button.closest('.code-block-container').querySelector('code');
        try {
            // 获取原始代码文本（解码HTML实体）
            const codeText = codeBlock.textContent
                .replace(/\u00a0/g, ' ')  // 将不换行空格转换为普通空格
                .replace(/&#10;/g, '\n')  // 将HTML换行符转换为实际换行符
                .replace(/&nbsp;/g, ' '); // 将HTML空格转换为普通空格

            await navigator.clipboard.writeText(codeText);
            button.textContent = '已复制!';
            button.classList.add('copied');
            setTimeout(() => {
                button.textContent = '复制';
                button.classList.remove('copied');
            }, 2000);
        } catch (err) {
            console.error('复制失败:', err);
            button.textContent = '复制失败';
            setTimeout(() => {
                button.textContent = '复制';
            }, 2000);
        }
    }

    /**
     * 发送用户消息
     */
    async sendMessage() {
        const message = this.userInput.value.trim();
        if (!message) return;

        // 添加用户消息到聊天
        this.addMessage(message, 'user');
        this.userInput.value = '';
        this.autoResizeTextarea();

        if (!this.api.apiKey) {
            this.showApiKeyPrompt();
            if (!this.api.apiKey) {
                this.addMessage('未设置API密钥，无法继续对话。', 'system');
                return;
            }
        }

        try {
            // 创建一个空的AI消息元素
            this.currentMessageElement = this.createMessageElement('', 'ai');
            this.chatMessages.appendChild(this.currentMessageElement);
            
            // 使用API发送消息并获取流式响应
            await this.api.streamChat(
                message,
                // 每个块的回调
                (content) => {
                    this.updateCurrentMessage(content);
                },
                // 完成时的回调
                (fullResponse) => {
                    // 重新格式化最终消息
                    if (this.currentMessageElement) {
                        const formattedContent = this.markdown.format(fullResponse);
                        this.currentMessageElement.innerHTML = formattedContent;
                        this.markdown.highlightCodeBlocks(this.currentMessageElement);
                    }
                }
            );
        } catch (error) {
            console.error('发送消息错误:', error);
            this.addMessage('对不起，处理您的请求时出现错误。' + error.message, 'system');
        }
    }

    /**
     * 更新当前消息内容
     * @param {string} content - 消息内容
     */
    updateCurrentMessage(content) {
        if (this.currentMessageElement) {
            const formattedContent = this.markdown.format(content);
            this.currentMessageElement.innerHTML = formattedContent;
            this.markdown.highlightCodeBlocks(this.currentMessageElement);
            
            // 平滑滚动到底部
            this.smoothScrollToBottom();
        }
    }
    
    /**
     * 平滑滚动到聊天底部
     */
    smoothScrollToBottom() {
        this.chatMessages.scrollTo({
            top: this.chatMessages.scrollHeight,
            behavior: 'smooth'
        });
    }

    /**
     * 创建消息元素
     * @param {string} content - 消息内容
     * @param {string} type - 消息类型 (user/ai/system)
     * @returns {HTMLElement} 消息元素
     */
    createMessageElement(content, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        
        if (type === 'user') {
            messageDiv.textContent = content;
        } else {
            const formattedContent = this.markdown.format(content);
            messageDiv.innerHTML = formattedContent;
            
            // 若为空消息，添加一个加载指示器
            if (!content.trim() && type === 'ai') {
                const loadingDiv = document.createElement('div');
                loadingDiv.className = 'typing-indicator';
                loadingDiv.innerHTML = '<span></span><span></span><span></span>';
                messageDiv.appendChild(loadingDiv);
            } else {
                this.markdown.highlightCodeBlocks(messageDiv);
            }
        }
        
        return messageDiv;
    }

    /**
     * 添加消息到聊天窗口
     * @param {string} content - 消息内容
     * @param {string} type - 消息类型 (user/ai/system)
     */
    addMessage(content, type) {
        const messageDiv = this.createMessageElement(content, type);
        this.chatMessages.appendChild(messageDiv);
        this.smoothScrollToBottom();
    }
}

export default ChatUIManager; 