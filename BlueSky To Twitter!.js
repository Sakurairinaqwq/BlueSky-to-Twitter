// ==UserScript==
// @name         Control Panel for BlueSky
// @namespace    https://github.com/Sakurairinaqwq/BlueSky-to-Twitter
// @version      1.1.0
// @description  让 BlueSky 变回 2022 年的 Twitter！支持多语言选择、UI 控制面板、精准去广告与各种怀旧细节。
// @author       Sakurairinaqwq & Gemini
// @match        https://bsky.app/*
// @icon         https://abs.twimg.com/favicons/twitter.2.ico
// @grant        GM_addStyle
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    /**
     * =================================================================
     * 0. 全局配置与素材库
     * 我们尽量把硬编码的素材放在这里，方便以后要换颜色或者图标时统一修改。
     * =================================================================
     */
    const CONFIG_KEY = 'bsky_nostalgia_config_v2'; // 升级了key，确保旧配置不会干扰新版
    const ASSETS = {
        // 这是 Twitter 经典的浅蓝色 (#1DA1F2)，比 BlueSky 默认的蓝色更亮一点，更有“那味儿”。
        twitterBlue: 'rgb(29, 155, 240)',
        // 使用官方归档的 Favicon，原汁原味。
        twitterIcon: 'https://abs.twimg.com/favicons/twitter.2.ico',
        // 这是那只经典小鸟的 SVG 路径数据。蝴蝶虽然也好看，但我们今天是来怀旧的。
        birdPath: "M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"
    };

    /**
     * =================================================================
     * 1. 多语言字典 (i18n)
     * 这里定义了所有支持的语言。脚本会根据用户的选择（或者浏览器默认设置）
     * 来决定是显示 "推文" 还是 "Tweet"。
     * =================================================================
     */
    const I18N = {
        'en': { label: 'English', tweet: 'Tweet', newTweet: 'New Tweet', whatsHappening: "What's happening?", twitter: 'Twitter', cpTitle: 'Twitter Nostalgia', cpItems: ['Classic Bird Logo', 'Favicon Replacement', 'Twitter Blue Color', 'Text (Post -> Tweet)'] },
        'zh': { label: '简体中文', tweet: '推文', newTweet: '推文', whatsHappening: "发生了什么新鲜事？", twitter: 'Twitter', cpTitle: 'Twitter 怀旧模式', cpItems: ['经典蓝鸟 Logo', '浏览器图标 (Favicon)', 'Twitter Blue 配色', '文案替换 (帖文->推文)'] },
        'ja': { label: '日本語', tweet: 'ツイート', newTweet: 'ツイートする', whatsHappening: "いまどうしてる？", twitter: 'Twitter', cpTitle: 'Twitter ノスタルジア', cpItems: ['青い鳥ロゴ', 'ファビコン変更', 'Twitterブルー配色', 'テキスト置換 (Post→Tweet)'] },
        'ko': { label: '한국어', tweet: '트윗', newTweet: '트윗하기', whatsHappening: "무슨 일이 일어나고 있나요?", twitter: 'Twitter', cpTitle: 'Twitter 향수', cpItems: ['클래식 버드 로고', '파비콘 교체', 'Twitter 블루 컬러', '텍스트 교체 (Post->Tweet)'] },
        'de': { label: 'Deutsch', tweet: 'Twittern', newTweet: 'Twittern', whatsHappening: "Was gibt's Neues?", twitter: 'Twitter', cpTitle: 'Twitter Nostalgie', cpItems: ['Vogel-Logo', 'Favicon', 'Twitter-Blau', 'Text (Post -> Tweet)'] },
        'fr': { label: 'Français', tweet: 'Tweeter', newTweet: 'Tweeter', whatsHappening: "Quoi de neuf ?", twitter: 'Twitter', cpTitle: 'Nostalgie Twitter', cpItems: ['Logo Oiseau', 'Favicon', 'Bleu Twitter', 'Texte (Post -> Tweet)'] },
        'es': { label: 'Español', tweet: 'Twittear', newTweet: 'Twittear', whatsHappening: "¿Qué está pasando?", twitter: 'Twitter', cpTitle: 'Nostalgia de Twitter', cpItems: ['Logo del Pájaro', 'Favicon', 'Azul Twitter', 'Texto (Post -> Tweet)'] },
        'pt': { label: 'Português', tweet: 'Tweetar', newTweet: 'Tweetar', whatsHappening: "O que está acontecendo?", twitter: 'Twitter', cpTitle: 'Nostalgia do Twitter', cpItems: ['Logo do Pássaro', 'Favicon', 'Azul Twitter', 'Texto (Post -> Tweet)'] },
        'ru': { label: 'Русский', tweet: 'Твитнуть', newTweet: 'Твитнуть', whatsHappening: "Что происходит?", twitter: 'Twitter', cpTitle: 'Ностальгия по Twitter', cpItems: ['Логотип птицы', 'Фавикон', 'Цвет Twitter', 'Текст (Пост -> Твит)'] },
        // 下面的语言虽然没有翻译控制面板，但核心文案替换依然生效
        'it': { label: 'Italiano', tweet: 'Twittare', newTweet: 'Twittare', whatsHappening: "Che c'è di nuovo?", twitter: 'Twitter' },
        'nl': { label: 'Nederlands', tweet: 'Twitteren', newTweet: 'Twitteren', whatsHappening: "Wat houdt je bezig?", twitter: 'Twitter' },
        'tr': { label: 'Türkçe', tweet: 'Tweetle', newTweet: 'Tweetle', whatsHappening: "Neler oluyor?", twitter: 'Twitter' },
        'pl': { label: 'Polski', tweet: 'Tweetnij', newTweet: 'Tweetnij', whatsHappening: "Co się dzieje?", twitter: 'Twitter' },
        'id': { label: 'Bahasa Indonesia', tweet: 'Tweet', newTweet: 'Tweet', whatsHappening: "Apa yang sedang terjadi?", twitter: 'Twitter' },
        'ar': { label: 'العربية', tweet: 'تغريد', newTweet: 'تغريد', whatsHappening: "ماذا يحدث؟", twitter: 'تويتر' },
        'th': { label: 'ไทย', tweet: 'ทวีต', newTweet: 'ทวีต', whatsHappening: "มีอะไรเกิดขึ้นบ้าง?", twitter: 'Twitter' },
        'vi': { label: 'Tiếng Việt', tweet: 'Tweet', newTweet: 'Đăng Tweet', whatsHappening: "Chuyện gì đang xảy ra?", twitter: 'Twitter' },
        'hi': { label: 'हिन्दी', tweet: 'ट्वीट', newTweet: 'ट्वीट करें', whatsHappening: "क्या हो रहा है?", twitter: 'Twitter' },
        'uk': { label: 'Українська', tweet: 'Твітнути', newTweet: 'Твітнути', whatsHappening: "Що відбувається?", twitter: 'Twitter' }
    };

    /**
     * =================================================================
     * 2. 初始化设置
     * 读取用户之前的偏好设置，如果第一次来，就给个默认全开的配置。
     * =================================================================
     */
    let settings = { 
        logo: true, 
        favicon: true, 
        color: true, 
        text: true, 
        language: 'auto' // 默认跟随浏览器或网页语言
    };
    
    const saved = localStorage.getItem(CONFIG_KEY);
    if (saved) { 
        try { 
            settings = JSON.parse(saved); 
        } catch(e) {
            console.warn("BlueSky CP: 配置文件读取失败，重置为默认。");
        } 
    }

    /**
     * 辅助函数：决定当前该用哪种语言。
     * 逻辑：用户强制指定 > 浏览器/网页语言 > 默认回退英文
     */
    function getLangConfig() {
        if (settings.language !== 'auto' && I18N[settings.language]) {
            return I18N[settings.language];
        }
        
        const langCode = (document.documentElement.lang || navigator.language || 'en').toLowerCase();
        
        // 先试试完全匹配 (比如 zh-CN)
        if (I18N[langCode]) return I18N[langCode];
        
        // 再试试主语言匹配 (比如 zh-CN 匹配到 zh)
        const mainLang = langCode.split('-')[0];
        if (I18N[mainLang]) return I18N[mainLang];
        
        // 实在不行就英文
        return I18N.en;
    }
    
    // 初始化当前语言包
    const CUR_TEXT = getLangConfig();
    // 控制面板如果不支持当前语言，就用英文显示，不影响功能
    const UI_TEXT = (CUR_TEXT.cpTitle) ? CUR_TEXT : I18N.en;

    /**
     * =================================================================
     * 3. CSS 样式注入 (核心手术刀)
     * 这里不仅定义了控制面板的样式，还包含了一个非常关键的 CSS 规则，
     * 用于切除 BlueSky 登录页那个顽固的双重 Logo。
     * =================================================================
     */
    const css = `
        /* >>> 核心修复区域 <<< 
           这个选择器非常长，但必须这么精确。
           它专门针对登录页/欢迎页那个导致“双鸟重叠”的占位符 DIV。
           一旦匹配到，直接 display: none 隐藏，眼不见为净。
        */
        #root > div.css-g5y9jx.r-13awgt0.r-12vffkv > div.css-g5y9jx.r-13awgt0.r-12vffkv > div.css-g5y9jx.r-13awgt0 > div.css-g5y9jx.r-13awgt0 > div.css-g5y9jx:first-child > div.css-g5y9jx > div.css-g5y9jx:last-child > div.css-g5y9jx:first-child > div.css-g5y9jx:first-child > div.css-g5y9jx:nth-child(2) {
            display: none !important;
            visibility: hidden !important;
            width: 0 !important;
            height: 0 !important;
            pointer-events: none !important;
        }

        /* --- 浮动开关按钮 (左下角那个蓝色小球) --- */
        #cp-toggle-btn {
            position: fixed; bottom: 20px; left: 20px; width: 45px; height: 45px;
            background: ${ASSETS.twitterBlue}; border-radius: 50%; cursor: pointer;
            z-index: 99999; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            display: flex; align-items: center; justify-content: center;
            transition: transform 0.2s;
        }
        #cp-toggle-btn:hover { transform: scale(1.1); }
        #cp-toggle-btn svg { width: 24px; height: 24px; fill: white; }

        /* --- 主控制面板 (白底圆角) --- */
        #cp-main-panel {
            position: fixed; bottom: 80px; left: 20px; width: 260px;
            background: #ffffff; color: #0f1419; border-radius: 16px; padding: 16px;
            z-index: 99999; box-shadow: 0 8px 30px rgba(0,0,0,0.12);
            font-family: system-ui, -apple-system, sans-serif; display: none;
            border: 1px solid #eff3f4;
        }
        /* 适配夜间模式 */
        @media (prefers-color-scheme: dark) {
            #cp-main-panel { background: #000; color: #fff; border-color: #333; }
        }
        /* 面板弹出的动画 */
        #cp-main-panel.active { display: block; animation: popUp 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        @keyframes popUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        /* 面板内部元素布局 */
        .cp-header { display: flex; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #eff3f4; padding-bottom: 10px; }
        .cp-item { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-size: 14px; font-weight: 500; }
        
        /* --- 滑动开关 (Toggle Switch) --- */
        .cp-switch { position: relative; width: 40px; height: 22px; }
        .cp-switch input { opacity: 0; width: 0; height: 0; }
        .cp-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .3s; border-radius: 22px; }
        .cp-slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 2px; bottom: 2px; background-color: white; transition: .3s; border-radius: 50%; }
        input:checked + .cp-slider { background-color: ${ASSETS.twitterBlue}; }
        input:checked + .cp-slider:before { transform: translateX(18px); }
        
        /* --- 语言下拉菜单 --- */
        .cp-select {
            padding: 4px 8px; border-radius: 6px; border: 1px solid #ccc;
            background: #fff; color: #333; font-size: 12px; outline: none; cursor: pointer;
        }
        @media (prefers-color-scheme: dark) { .cp-select { background: #333; color: #fff; border-color: #555; } }

        /* --- 动态功能 CSS (根据设置决定是否生效) --- */
        
        /* 1. 强制覆盖按钮颜色 (如果开启) */
        ${settings.color ? `
            /* 侧边栏和发布框的按钮：强制改成 Twitter 蓝 */
            button[aria-label="撰写新帖文"], button[aria-label="Create new post"], 
            button[aria-label="撰写新推文"], button[aria-label="New Tweet"],
            button[aria-label="ツイートする"], button[aria-label="트윗하기"] { 
                background-color: ${ASSETS.twitterBlue} !important; 
            }
            /* 移动端/窄屏模式下的悬浮按钮 */
            div[role="button"][style*="background-color: rgb(0, 133, 255)"],
            div[role="button"][style*="background-color: rgb(32, 139, 254)"] { 
                background-color: ${ASSETS.twitterBlue} !important; 
            }
        ` : ''}

        /* 2. 隐藏原版蝴蝶 Logo (防止闪烁) */
        ${settings.logo ? `
            path[d^="M13.873"], path[d*="M50.127"] { visibility: hidden; opacity: 0; } 
            a[aria-label="Bluesky"] svg { overflow: visible !important; }
        ` : ''}
    `;

    const styleEl = document.createElement('style');
    styleEl.innerHTML = css;
    document.head.appendChild(styleEl);

    /**
     * =================================================================
     * 4. Favicon 强力劫持
     * 这段代码非常底层。因为 SPA 页面喜欢自己改图标，我们直接用 
     * Object.defineProperty 劫持了 HTMLLinkElement 的 href 属性。
     * 无论 BlueSky 想怎么改，只要是 icon，都得听我们的。
     * =================================================================
     */
    if (settings.favicon) {
        const originalHrefDescriptor = Object.getOwnPropertyDescriptor(HTMLLinkElement.prototype, 'href');
        if (originalHrefDescriptor) {
            Object.defineProperty(HTMLLinkElement.prototype, 'href', {
                set: function(v) {
                    // 如果是 icon 类型的 link，强制返回小鸟图标
                    if (this.rel && (this.rel.includes('icon') || this.rel === 'shortcut icon')) { 
                        return originalHrefDescriptor.set.call(this, ASSETS.twitterIcon); 
                    }
                    return originalHrefDescriptor.set.call(this, v);
                },
                get: function() { return originalHrefDescriptor.get.call(this); }
            });
        }
        // 立即创建一次，以防万一
        const link = document.createElement('link'); 
        link.rel = 'icon'; 
        link.href = ASSETS.twitterIcon; 
        document.head.appendChild(link);
    }

    /**
     * =================================================================
     * 5. DOM 补丁主逻辑 (PatchUI)
     * 这是脚本的心脏。它会被 MutationObserver 疯狂调用，所以必须高效。
     * 它负责：换 Logo SVG、改按钮文字、改页面标题。
     * =================================================================
     */
    function patchUI() {
        if (!settings.logo && !settings.text) return;

        // A. Logo 替换逻辑
        if (settings.logo) {
            document.querySelectorAll('svg').forEach(svg => {
                const path = svg.querySelector('path'); 
                if (!path) return;
                
                // 检查 SVG path 数据，识别是不是蝴蝶
                const d = path.getAttribute('d') || '';
                // BlueSky 的蝴蝶路径通常包含这些特征
                if (d.includes('M8.478') || d.startsWith('M13.873') || d.includes('M50.127')) {
                    svg.setAttribute('viewBox', '0 0 24 24'); 
                    path.setAttribute('d', ASSETS.birdPath);
                    path.setAttribute('fill', ASSETS.twitterBlue); // 确保是蓝色的
                    path.style.visibility = 'visible'; 
                    path.style.opacity = '1';
                }
            });
        }

        // B. 文案替换逻辑 (Post -> Tweet)
        if (settings.text) {
            // 1. 处理欢迎语 "What's happening?"
            const welcomeText = document.querySelector('div[dir="auto"]');
            if (welcomeText && welcomeText.style.fontSize && welcomeText.textContent.includes('Bluesky')) {
                welcomeText.textContent = CUR_TEXT.whatsHappening;
                // 如果开启了颜色替换，顺便把字也变蓝
                welcomeText.style.color = settings.color ? ASSETS.twitterBlue : welcomeText.style.color;
            }

            // 2. 处理侧边栏的大按钮 "New Tweet"
            const postBtns = document.querySelectorAll('button[aria-label]');
            postBtns.forEach(btn => {
                if (btn.dataset.twFixed) return; // 已经处理过的就跳过，省资源

                // 使用 TreeWalker 深入遍历按钮内部的所有文本节点
                const walker = document.createTreeWalker(btn, NodeFilter.SHOW_TEXT, null, false);
                let node, hasReplaced = false;
                
                // 关键词列表：我们需要识别各种语言下的 "Post" 或 "新帖文"
                const keywords = ['New Post', '新帖文', '新しい投稿', '投稿', '게시', 'Posten', 'Publier', 'Publicar', 'Postar', 'Post', '撰写新帖文'];
                
                while(node = walker.nextNode()) {
                    if (keywords.some(s => node.nodeValue.includes(s))) {
                        node.nodeValue = CUR_TEXT.newTweet; 
                        hasReplaced = true;
                    }
                }
                
                if(hasReplaced) { 
                    btn.setAttribute('aria-label', CUR_TEXT.newTweet); 
                    btn.dataset.twFixed = "true"; 
                }
            });

            // 3. 处理网页标题 (Browser Tab Title)
            if (document.title.includes('Bluesky')) { 
                document.title = document.title.replace('Bluesky', CUR_TEXT.twitter); 
            }
        }
    }

    /**
     * =================================================================
     * 6. 构建控制面板
     * 创建 HTML 结构，绑定点击事件。这里包含语言选择器和开关。
     * =================================================================
     */
    function createPanel() {
        if(document.getElementById('cp-toggle-btn')) return;
        
        // 创建左下角的悬浮球
        const toggleBtn = document.createElement('div');
        toggleBtn.id = 'cp-toggle-btn';
        toggleBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="${ASSETS.birdPath}"></path></svg>`;
        document.body.appendChild(toggleBtn);
        
        // 创建面板容器
        const panel = document.createElement('div');
        panel.id = 'cp-main-panel';
        
        // 构建语言选项 HTML 字符串
        let langOptions = `<option value="auto">Auto (System)</option>`;
        for (const [code, langObj] of Object.entries(I18N)) {
            if(langObj.label) {
                // 标记当前选中的语言
                langOptions += `<option value="${code}" ${settings.language === code ? 'selected' : ''}>${langObj.label}</option>`;
            }
        }

        // 填充面板 HTML
        panel.innerHTML = `
            <div class="cp-header">
                <svg viewBox="0 0 24 24" style="width:20px; fill:${ASSETS.twitterBlue}"><path d="${ASSETS.birdPath}"></path></svg>
                <span class="cp-title">${UI_TEXT.cpTitle}</span>
            </div>
            
            <div class="cp-item">
                <span>Language / 语言</span>
                <select id="cp-lang-select" class="cp-select">${langOptions}</select>
            </div>
            
            ${createSwitch(UI_TEXT.cpItems[0], 'logo')} 
            ${createSwitch(UI_TEXT.cpItems[1], 'favicon')}
            ${createSwitch(UI_TEXT.cpItems[2], 'color')} 
            ${createSwitch(UI_TEXT.cpItems[3], 'text')}
            
            <div style="font-size:10px; color:#888; margin-top:15px; text-align:center;">
                Refresh to apply changes<br>
                Code by Sakurairinaqwq
            </div>
        `;
        document.body.appendChild(panel);
        
        // 点击小球切换面板显示/隐藏
        toggleBtn.addEventListener('click', () => panel.classList.toggle('active'));
        
        // 绑定语言选择器变更事件
        document.getElementById('cp-lang-select').addEventListener('change', (e) => {
            settings.language = e.target.value;
            localStorage.setItem(CONFIG_KEY, JSON.stringify(settings));
            location.reload(); // 语言改了必须刷新才能应用新的文案
        });

        // 绑定各个开关的事件
        ['logo', 'favicon', 'color', 'text'].forEach(key => {
            const el = document.getElementById(`cp-sw-${key}`);
            if(el) el.addEventListener('change', (e) => {
                settings[key] = e.target.checked;
                localStorage.setItem(CONFIG_KEY, JSON.stringify(settings));
                
                // 有些修改可以实时生效，有些（如颜色、图标）为了稳定建议刷新
                if(key === 'logo' || key === 'text') patchUI(); 
                if(key === 'color' || key === 'favicon') location.reload(); 
            });
        });
    }

    // 辅助函数：生成开关的 HTML
    function createSwitch(label, key) {
        return `
            <div class="cp-item">
                <span>${label}</span>
                <label class="cp-switch">
                    <input type="checkbox" id="cp-sw-${key}" ${settings[key]?'checked':''}>
                    <span class="cp-slider"></span>
                </label>
            </div>
        `;
    }

    /**
     * =================================================================
     * 7. 启动引擎
     * 使用 setInterval 进行初始轮询（因为页面加载初期 DOM 极不稳定），
     * 随后移交给 MutationObserver 进行长期监控。
     * =================================================================
     */
    // 初始加载检查 (每100ms检查一次，直到 body 出现)
    const initInterval = setInterval(() => {
        if (document.body) { 
            clearInterval(initInterval); 
            createPanel(); 
            patchUI(); // 立即执行一次
        }
    }, 100);

    // 长期监控：只要页面元素有变动，就重新运行 patchUI
    const observer = new MutationObserver(() => patchUI());
    observer.observe(document.documentElement, { childList: true, subtree: true });

})();
