# wechat-pdf-web（Cloudflare Pages 一键导出公众号 PDF）

## 你会得到什么
- 一个可直接打开的网址（形如 `https://xxx.pages.dev`）
- 在页面里粘贴公众号文章链接，点击按钮即可下载 PDF

## 目录结构
- `public/index.html`：前端页面
- `functions/api/pdf.js`：后端 Pages Function（调用 Cloudflare Browser Rendering 的 PDF API）
- `wrangler.toml`：Cloudflare Pages 配置

## 部署步骤（最短路径）
1. 登录 Cloudflare Dashboard → Pages → Create a project
2. 选择 **Upload assets**（上传压缩包解压后的目录，或把本项目推到 Git 再连接）
3. 在 Cloudflare 开通 Browser Rendering（按 Cloudflare 文档启用）
4. 创建 API Token，并获取 Account ID
5. Pages 项目 → Settings → Environment variables 添加：
   - `CF_ACCOUNT_ID`
   - `CF_API_TOKEN`
6. 重新部署（Redeploy），打开 `https://xxx.pages.dev` 使用

## 注意
- 公众号可能要求登录/验证：此方案不保证对所有文章都可用。
- 如遇折叠/轮播未完整渲染，可升级为“注入脚本自动展开/自动滑动”的版本。
