# Bluesky To Twitter (Bluesky to Twitter Retro) 🐦

这是一个基于 **Tampermonkey (油猴)** 开发的用户脚本，旨在将 **Bluesky (bsky.app)** 的视觉体验完美还原为经典的 **Twitter**。它不仅仅是简单的图标替换，还深入浏览器底层劫持了图标更新逻辑，并对登录页、欢迎词及交互按钮进行了深度定制。

## 核心功能 ✨

* **图标全量替换**：将页面所有蝴蝶 Logo 替换为经典的小蓝鸟。
* **Favicon 锁定**：劫持浏览器属性，防止 Bluesky 动态修改标签页图标，确保蓝鸟长驻。
* **登录页深度定制**：
* 移除冗余的 Logo 容器。
* 将 “Bluesky” 字母 Logo 替换为 Twitter 官方 Logo。
* 将欢迎词改为经典的 **“发生了什么新鲜事？”**。


* **文案还原**：将“新帖文”按钮改为**“新推文”**。
* **配色同步**：强制将相关组件颜色修正为 Twitter 经典的 **rgb(29, 155, 240)**。
* **性能优化**：通过 CSS 注入与无损 DOM 节点替换相结合，有效消除页面加载时的“视觉闪烁”。

## 安装说明 🛠️

1. 确保你的浏览器已安装 [Tampermonkey](https://www.tampermonkey.net/) 扩展。
2. 点击 Tampermonkey 图标，选择“添加新脚本”。
3. 将本仓库中的 `.js` 代码复制并粘贴到编辑器中。
4. 保存（Ctrl+S）并刷新 `https://bsky.app/` 即可生效。

## 技术原理 🧠

为了实现极致的视觉一致性，本脚本采用了以下进阶技术：

* **属性劫持 (Property Hijacking)**：通过 `Object.defineProperty` 拦截 `HTMLLinkElement.prototype.href` 的 Setter，从而彻底锁死 Favicon。
* **逻辑分治**：脚本会自动识别“登录页”与“主站应用”，应用两套互不冲突的视觉修正方案。
* **无损文本替换**：通过遍历 `childNodes` 仅修改文本节点内容，完美保留 React 原生的样式类名和交互逻辑。
* **CSS 预渲染屏蔽**：利用 `!important` 权重的 CSS 选择器在 JS 执行前拦截并隐藏原始 UI 组件。

## 注意事项 ⚠️

* 本脚本仅在浏览器端运行，不会收集任何用户数据。
* 由于 Bluesky 采用 React Native for Web，前端代码会不定期更新。如果发现某个图标“复活”，请及时通过控制台检查元素特征，并前往issues进行报告！
