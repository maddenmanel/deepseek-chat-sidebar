/**
 * DeepSeek API交互模块
 */
class DeepSeekAPI {
    constructor() {
        this.apiKey = '';
    }

    /**
     * 加载API密钥
     * @param {Function} onMissingKey - 当没有密钥时的回调函数
     * @returns {Promise<string|null>} API密钥或null
     */
    async loadApiKey(onMissingKey) {
        return new Promise((resolve) => {
            chrome.storage.sync.get(['deepseekApiKey'], (result) => {
                if (result.deepseekApiKey) {
                    this.apiKey = result.deepseekApiKey;
                    resolve(this.apiKey);
                } else {
                    if (onMissingKey) {
                        onMissingKey();
                    }
                    resolve(null);
                }
            });
        });
    }

    /**
     * 保存API密钥
     * @param {string} apiKey - 要保存的API密钥
     * @returns {Promise<void>}
     */
    async saveApiKey(apiKey) {
        return new Promise((resolve) => {
            chrome.storage.sync.set({ deepseekApiKey: apiKey }, () => {
                this.apiKey = apiKey;
                resolve();
            });
        });
    }

    /**
     * 发送聊天请求并处理流式响应
     * @param {string} message - 用户消息
     * @param {Function} onChunk - 收到每个响应块时的回调
     * @param {Function} onComplete - 响应完成时的回调
     * @returns {Promise<string>} 完整的响应文本
     */
    async streamChat(message, onChunk, onComplete) {
        try {
            if (!this.apiKey) {
                throw new Error('API密钥未设置');
            }

            const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    messages: [{ role: 'user', content: message }],
                    model: 'deepseek-chat',
                    stream: true
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let fullResponse = '';

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                
                // 处理完整的JSON对象
                let newlineIndex;
                while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
                    const line = buffer.slice(0, newlineIndex).trim();
                    buffer = buffer.slice(newlineIndex + 1);

                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') continue;

                        try {
                            const parsed = JSON.parse(data);
                            const content = parsed.choices[0]?.delta?.content;
                            if (content) {
                                fullResponse += content;
                                if (onChunk) {
                                    onChunk(fullResponse);
                                }
                            }
                        } catch (e) {
                            console.error('Error parsing JSON:', e);
                        }
                    }
                }
            }

            if (onComplete) {
                onComplete(fullResponse);
            }
            
            return fullResponse;
        } catch (error) {
            console.error('API错误:', error);
            throw error;
        }
    }
}

// 导出API类
export default DeepSeekAPI; 