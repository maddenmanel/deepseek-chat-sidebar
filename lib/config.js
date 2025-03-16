/**
 * 应用程序配置
 */
const Config = {
    /**
     * API相关配置
     */
    api: {
        /** DeepSeek API基础URL */
        baseUrl: 'https://api.deepseek.com/v1/chat/completions',
        /** 默认模型 */
        defaultModel: 'deepseek-chat',
        /** 存储密钥的名称 */
        keyStorageName: 'deepseekApiKey'
    },
    
    /**
     * UI相关配置
     */
    ui: {
        /** 输入框最大高度 */
        maxInputHeight: 200,
        /** 按钮文本配置 */
        buttonText: {
            copy: '复制',
            copied: '已复制!',
            copyFailed: '复制失败'
        },
        /** 动画时间配置 */
        animationDuration: {
            copyButton: 2000
        }
    },
    
    /**
     * 本地化文本
     */
    localization: {
        prompts: {
            apiKey: '请输入您的DeepSeek API密钥:',
            error: '对不起，处理您的请求时出现错误。',
            noApiKey: '未设置API密钥，无法继续对话。'
        }
    }
};

export default Config; 