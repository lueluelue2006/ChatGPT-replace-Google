// ==UserScript==
// @name         Google 搜索跳转到 ChatGPT
// @namespace    https://github.com/schweigen
// @version      1.6
// @description  在 Google 搜索页面添加按钮，一键跳转到 ChatGPT 并自动使用联网搜索
// @author       schweigen
// @match        https://www.google.com/search*
// @match        https://google.com/search*
// @match        https://chatgpt.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=google.com
// @grant        none
// @license      MIT
// @noframes
// ==/UserScript==

/**
 * 用户设置 - 可以修改以下变量来自定义脚本行为
 */
const USER_SETTINGS = {
    // 是否启用临时聊天模式
    ENABLE_TEMPORARY_CHAT: false,

    // 默认使用的模型
    DEFAULT_MODEL: "o4-mini", // 其他模型：gpt-4o, gpt-4o-mini, o4-mini, o4-mini-high, o3, o3-pro（注：gpt-4-5搜索水平和gpt-4o差不多）

    // 按钮的垂直位置（距离顶部的像素值）
    BUTTON_TOP_POSITION: 80,

    // 按钮的水平位置（距离右侧的像素值）
    BUTTON_RIGHT_POSITION: 20,

    // 要添加到搜索前的前缀文字
    SEARCH_PREFIX: "联网搜索 ",

    // 等待发送按钮出现的最长时间（毫秒）
    SEND_BUTTON_WAIT_TIMEOUT: 5000
};

(function() {
    'use strict';

    // 判断当前页面是Google还是ChatGPT
    const isGooglePage = window.location.hostname.includes('google');
    const isChatGPTPage = window.location.hostname.includes('chatgpt.com');

    // 处理Google搜索页面
    if (isGooglePage) {
        // 创建按钮样式
        const style = document.createElement('style');
        style.textContent = `
            .gpt-button {
                background-color: #10a37f;
                color: white;
                border: none;
                border-radius: 4px;
                padding: 8px 12px;
                margin: 10px 15px 10px 0;
                font-size: 14px;
                cursor: pointer;
                display: flex;
                align-items: center;
                transition: background-color 0.3s;
                position: fixed;
                top: ${USER_SETTINGS.BUTTON_TOP_POSITION}px;
                right: ${USER_SETTINGS.BUTTON_RIGHT_POSITION}px;
                z-index: 1000;
            }
            .gpt-button:hover {
                background-color: #0d8c6d;
            }
            .gpt-icon {
                margin-right: 6px;
                width: 16px;
                height: 16px;
            }
        `;
        document.head.appendChild(style);

        // 创建按钮
        function createGptButton() {
            const button = document.createElement('button');
            button.className = 'gpt-button';

            // 简单的GPT图标（SVG内联）
            const iconSvg = `<svg class="gpt-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="white" d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.5093-2.6067-1.4997z"></path></svg>`;

            button.innerHTML = iconSvg + 'GPT搜索';

            // 点击事件处理
            button.addEventListener('click', function() {
                // 获取当前搜索框的值
                const searchInput = document.querySelector('input[name="q"]');
                if (searchInput) {
                    redirectToChatGPT(searchInput.value);
                }
            });

            return button;
        }

        // 重定向到ChatGPT的函数
        function redirectToChatGPT(searchText) {
            // 构建URL参数
            let urlParams = `model=${USER_SETTINGS.DEFAULT_MODEL}&prompt=${encodeURIComponent(USER_SETTINGS.SEARCH_PREFIX + searchText)}`;

            // 如果启用了临时聊天
            if (USER_SETTINGS.ENABLE_TEMPORARY_CHAT) {
                urlParams += '&temporary-chat=true';
            }

            // 构建完整URL并跳转
            const chatGptUrl = `https://chatgpt.com/?${urlParams}`;
            window.open(chatGptUrl, '_blank');
        }

        // 添加按钮到Google搜索页面
        function addButtonToPage() {
            // 直接添加到body，使用fixed定位
            if (!document.querySelector('.gpt-button')) {
                const button = createGptButton();
                document.body.appendChild(button);
            }
        }

        // 网页加载完成后添加按钮
        window.addEventListener('load', function() {
            addComponentsToPage();
        });

        // 为了处理Google的动态加载，也在DOM变化时尝试添加按钮
        const observer = new MutationObserver(function(mutations) {
            if (!document.querySelector('.gpt-button')) {
                addButtonToPage();
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });

        // 初始尝试添加按钮
        setTimeout(addButtonToPage, 1000);
    }
    else if (isChatGPTPage) {
        // ChatGPT页面的脚本处理

        // 从URL参数中检查是否是从Google搜索跳转过来的
        const urlParams = new URLSearchParams(window.location.search);
        const promptParam = urlParams.get('prompt');

        if (promptParam) {
            // 标记是否已经点击过发送按钮
            let hasClickedSendButton = false;

            // 使用MutationObserver监听DOM变化，等待发送按钮出现
            const observer = new MutationObserver(function(mutations) {
                if (hasClickedSendButton) return; // 如果已经点击过，不再尝试

                // 尝试精确匹配发送按钮
                const sendButton = document.querySelector('button#composer-submit-button[data-testid="send-button"]');

                if (sendButton && !sendButton.disabled) {
                    console.log("找到发送按钮，准备点击");
                    hasClickedSendButton = true; // 标记为已点击

                    // 创建一个鼠标点击事件
                    const clickEvent = new MouseEvent('click', {
                        bubbles: true,
                        cancelable: true,
                        view: window
                    });

                    // 分发事件到发送按钮
                    sendButton.dispatchEvent(clickEvent);
                    console.log("已点击发送按钮，停止监听");

                    // 停止观察
                    observer.disconnect();
                }
            });

            // 开始观察文档
            observer.observe(document, { childList: true, subtree: true });

            // 设置超时，最多等待指定时间
            setTimeout(function() {
                if (!hasClickedSendButton) {
                    console.log("达到最大等待时间，停止监听");
                    observer.disconnect();
                }
            }, USER_SETTINGS.SEND_BUTTON_WAIT_TIMEOUT);
        }
    }
})();
