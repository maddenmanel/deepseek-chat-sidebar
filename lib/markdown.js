/**
 * Markdown格式化工具
 */
class MarkdownFormatter {
    /**
     * 将HTML特殊字符进行转义
     * @param {string} text - 需要转义的文本
     * @returns {string} 转义后的文本
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * 格式化Markdown文本为HTML
     * @param {string} content - Markdown文本
     * @returns {string} 格式化后的HTML
     */
    format(content) {
        // 处理代码块
        content = this.formatCodeBlocks(content);
        
        // 处理内联代码
        content = this.formatInlineCode(content);
        
        // 处理其他Markdown语法
        return this.formatBasicMarkdown(content);
    }
    
    /**
     * 处理代码块格式化
     * @param {string} content - 原始内容
     * @returns {string} 处理后的内容
     */
    formatCodeBlocks(content) {
        return content.replace(/```([\w-]*)\n([\s\S]*?)```/g, (match, language, code) => {
            // 规范化语言名称
            let displayLanguage = language ? language.toLowerCase() : 'plaintext';
            let languageClass = `language-${displayLanguage}`;
            
            // 处理空代码块
            if (!code.trim()) {
                return this.createEmptyCodeBlockHtml(displayLanguage, languageClass);
            }

            // 处理代码缩进
            const { formattedCode, escapedCode } = this.processCodeIndentation(code);

            return this.createCodeBlockHtml(displayLanguage, languageClass, escapedCode);
        });
    }
    
    /**
     * 处理代码缩进并返回格式化后的代码
     * @param {string} code - 原始代码
     * @returns {Object} 包含格式化和转义后代码的对象
     */
    processCodeIndentation(code) {
        // 保持原始缩进
        const lines = code.split('\n');
        
        // 移除首尾空行但保留中间空行
        while (lines.length > 0 && lines[0].trim() === '') lines.shift();
        while (lines.length > 0 && lines[lines.length - 1].trim() === '') lines.pop();
        
        // 计算最小缩进以保持相对缩进
        const minIndent = lines
            .filter(line => line.trim().length > 0)
            .reduce((min, line) => {
                const indent = line.match(/^\s*/)[0].length;
                return indent < min ? indent : min;
            }, Infinity) || 0;
        
        // 应用相对缩进，确保换行符被保留
        const formattedCode = lines
            .map(line => {
                if (line.trim().length === 0) return '';
                return line.slice(Math.min(minIndent, line.match(/^\s*/)[0].length));
            })
            .join('\n');

        // 转义HTML但保留空格、制表符和换行符
        const escapedCode = this.escapeHtml(formattedCode)
            .replace(/ /g, '&nbsp;')
            .replace(/\t/g, '&nbsp;&nbsp;') // 使用2个空格而不是4个来减少宽度
            .split('\n')
            .join('&#10;'); // 使用 &#10; 来表示换行符
            
        return { formattedCode, escapedCode };
    }
    
    /**
     * 创建代码块的HTML
     * @param {string} displayLanguage - 语言显示名称
     * @param {string} languageClass - 语言CSS类名
     * @param {string} escapedCode - 转义后的代码
     * @returns {string} HTML代码
     */
    createCodeBlockHtml(displayLanguage, languageClass, escapedCode) {
        return `<div class="code-block-container" data-language="${displayLanguage}"><pre><code class="${languageClass}">${escapedCode}</code></pre><button class="copy-button">复制</button></div>`;
    }
    
    /**
     * 创建空代码块的HTML
     * @param {string} displayLanguage - 语言显示名称
     * @param {string} languageClass - 语言CSS类名
     * @returns {string} HTML代码
     */
    createEmptyCodeBlockHtml(displayLanguage, languageClass) {
        return `<div class="code-block-container" data-language="${displayLanguage}"><pre><code class="${languageClass}"></code></pre><button class="copy-button">复制</button></div>`;
    }
    
    /**
     * 处理内联代码
     * @param {string} content - 原始内容
     * @returns {string} 处理后的内容
     */
    formatInlineCode(content) {
        return content.replace(/`([^`]+)`/g, (match, code) => {
            const escapedCode = this.escapeHtml(code)
                .replace(/ /g, '&nbsp;')
                .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
            return `<code>${escapedCode}</code>`;
        });
    }
    
    /**
     * 处理基础Markdown格式
     * @param {string} content - 原始内容
     * @returns {string} 处理后的内容
     */
    formatBasicMarkdown(content) {
        // 将连续的换行符转换为段落
        content = content
            .replace(/\n\n+/g, '</p><p>') // 多个连续换行符转为段落
            .replace(/\n/g, '<br>');       // 单个换行符转为<br>
            
        // 如果内容包含段落标记，确保前后有完整的标签
        if (content.includes('</p><p>')) {
            if (!content.startsWith('<p>')) {
                content = '<p>' + content;
            }
            if (!content.endsWith('</p>')) {
                content = content + '</p>';
            }
        }
        
        // 处理其他Markdown语法
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
    }

    /**
     * 高亮代码块
     * @param {HTMLElement} element - 包含代码块的HTML元素
     */
    highlightCodeBlocks(element) {
        // 找到所有代码块并应用高亮
        const codeBlocks = element.querySelectorAll('pre code');
        codeBlocks.forEach(block => {
            // 确保代码块内容保持原始格式
            const originalCode = block.textContent;
            // 将 HTML 换行符转换回实际的换行符
            const decodedCode = originalCode
                .replace(/&#10;/g, '\n')
                .replace(/&nbsp;/g, ' ');
            block.textContent = decodedCode;
            // 应用 Prism.js 高亮
            if (window.Prism) {
                Prism.highlightElement(block);
            }
        });
    }
}

// 导出Markdown格式化器
export default MarkdownFormatter; 