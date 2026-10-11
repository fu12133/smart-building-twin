# Context

应用为纯浏览器静态前端，适合 GitHub Pages，无需后台服务器。当前有效 gh CLI 登录账号为 guangfubill-crypto。仓库名称默认 smart-building-twin，若已存在则不覆盖并选择独立名称。

# Goals / Non-Goals

目标：源码可追溯；别人通过 HTTPS 网址直接访问；子路径资源加载正确；每次 main push 自动构建发布。

范围外：域名购买、生产 IoT 接入、用户管理或收费部署。

# Decisions

- Pages 通过官方 configure/upload/deploy actions 发布 dist；GITHUB_TOKEN 仅授予构建和 Pages 必需权限。
- Vite base 从构建环境 PAGES_BASE_PATH 读取，默认 /，本地开发地址不变。
- CI 运行规格校验、构建与现有交互 harness。CI harness 采用 Playwright Chromium，本机 Windows 保留 Edge。
- 使用 pnpm/npm lockfile 现有 npm ci 方案，不上传 node_modules、dist、浏览器 trace、本机路径报告或凭据。
- 公开/私有仓库由用户偏好决定；GitHub Pages 权益不足时报告实际 API 结果并选择可用托管。

# Verification

本地：strict OpenSpec validation、构建和仓库子路径 production smoke harness。

远端：main 分支 SHA 一致、Actions 构建和部署成功、公网 HTML 和资源可访问，在浏览器检查三维场景、旋转和 2.5D 设备点位。
