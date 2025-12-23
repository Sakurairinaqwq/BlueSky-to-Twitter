// ==UserScript==
// @name         让Bluesky 变回 Twitter！🐦
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  去你妈的马斯克！去你妈的X!
// @author       Sakurairinaqwq
// @match        https://bsky.app/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const twitterBlue = 'rgb(29, 155, 240)';
    const twitterIcon = 'https://abs.twimg.com/favicons/twitter.2.ico';
    const twitterPath = "M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z";

    // --- 1. CSS 预设：拦截并删除冗余 Logo 容器 ---
    const style = document.createElement('style');
    style.innerHTML = `
        /* 精准拦截你提到的那个导致双 Logo 的 div 容器 */
        div.css-g5y9jx[style*="padding-top: 40px"] {
            display: none !important;
            height: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: hidden !important;
        }

        /* 欢迎页文本样式微调 */
        div[style*="font-size: 20.6px"] {
            color: ${twitterBlue} !important;
            font-weight: 700 !important;
            margin-top: 20px !important;
        }

        /* 初始隐藏蝴蝶路径 */
        path[d^="M13.873"], path[d*="M50.127"] { visibility: hidden; }
    `;
    document.documentElement.appendChild(style);

    // --- 2. 劫持 Favicon (死守蓝鸟) ---
    const originalHrefDescriptor = Object.getOwnPropertyDescriptor(HTMLLinkElement.prototype, 'href');
    if (originalHrefDescriptor) {
        Object.defineProperty(HTMLLinkElement.prototype, 'href', {
            set: function(v) {
                if (this.rel && this.rel.includes('icon')) return originalHrefDescriptor.set.call(this, twitterIcon);
                return originalHrefDescriptor.set.call(this, v);
            },
            get: function() { return originalHrefDescriptor.get.call(this); }
        });
    }

    // --- 3. 核心逻辑 ---
    function patchUI() {
        // A. SVG 路径替换
        document.querySelectorAll('svg').forEach(svg => {
            const path = svg.querySelector('path');
            if (!path) return;

            const d = path.getAttribute('d') || '';
            // 识别 Bluesky 原生 Logo 路径或蝴蝶路径
            if (d.includes('M8.478') || d.startsWith('M13.873') || d.includes('M50.127')) {
                svg.setAttribute('viewBox', '0 0 24 24');
                path.setAttribute('d', twitterPath);
                path.setAttribute('fill', twitterBlue);
                path.style.visibility = 'visible';

                // 登录页 Logo 尺寸修正
                if (svg.getAttribute('width') === "161") {
                    svg.setAttribute('width', '50');
                    svg.setAttribute('height', '50');
                    svg.style.margin = '0 auto';
                }
            }
        });

        // B. 文本替换
        const welcomeText = document.querySelector('div[style*="font-size: 20.6px"]');
        if (welcomeText) {
            welcomeText.childNodes.forEach(node => {
                if (node.nodeType === 3 && node.nodeValue.includes('Bluesky')) {
                    node.nodeValue = '发生了什么新鲜事？';
                }
            });
        }

        // C. 按钮文字替换
        const postBtn = document.querySelector('button[aria-label="撰写新帖文"]');
        if (postBtn) {
            postBtn.setAttribute('aria-label', '撰写新推文');
            const textDiv = Array.from(postBtn.querySelectorAll('div')).find(d => d.innerText === '新帖文');
            if (textDiv) textDiv.childNodes.forEach(n => { if(n.nodeValue === '新帖文') n.nodeValue = '新推文'; });
            postBtn.style.backgroundColor = twitterBlue;
        }

        // D. 页面标题
        if (document.title.includes('Bluesky')) document.title = document.title.replace('Bluesky', 'Twitter');
    }

    // --- 4. 运行 ---
    const observer = new MutationObserver(patchUI);
    observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
    setInterval(patchUI, 400);

    const l = document.createElement('link');
    l.rel = 'icon';
    l.href = twitterIcon;
    document.head.appendChild(l);
})();