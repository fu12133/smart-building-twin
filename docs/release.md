# GitHub Pages 发布记录

已发布并通过公网浏览器验收。

- 公开源码：https://github.com/guangfubill-crypto/smart-building-twin
- HTTPS 使用地址：https://guangfubill-crypto.github.io/smart-building-twin/
- 初次部署证据：https://github.com/guangfubill-crypto/smart-building-twin/actions/runs/38154702834
- 首次应用提交：`b916dfa5d05fabc58225cd25c63da7235bb4940d`

## 远端验证

GitHub Actions 在 Linux + Chromium 环境通过 OpenSpec strict validation、**9 / 9** 用户交互验收和生产构建，并完成 Pages 部署。首次构建 2m15s，部署 8s。Pages API 返回正确项目网址，HTTPS 强制启用。

在本机 Microsoft Edge 浏览器对**真实公网地址**执行 `npm run harness:production`，最终 **1 / 1 passed，6.5s**。该测试确认：

- 主界面和真实 Three.js 场景可加载。
- 实际鼠标拖拽改变画布图像。
- 2.5D 楼层及空调设备详情可使用。
- 导航切换和视角复位正常。
- 所有观察到的生产资源 HTTP 响应成功，无浏览器控制台错误或未捕获异常。
- 开发诊断接口 `window.__BUILDING_HARNESS__` 不存在于生产页面。

公网截图：`artifacts/harness/production-online.png`，已检查。等待图表入场动画完成后捕获。

GitHub 远端树检查确认未上传 `node_modules`、`dist`、`test-results`、`playwright-report`、`.env` 或机器专属结果 JSON。源码上传前检查未发现私钥或服务 token。CLI 凭据由已有 gh keyring/credential helper 提供，没有写入源码或工作流。

## 后续更新

本地修改后执行规格校验、构建与适用 harness，再 `git push origin main`。官方 Actions 使用固定 SHA，通过检查后自动发布 Pages。CI 使用 Node 22 和 Chromium，本机 Windows harness 默认使用 Edge。仓库 base path 仅在生产构建时注入，本地开发仍在 4187 端口。

站点是静态演示应用；访客无需安装开发环境。模型与 IoT 指标仍为明确标识的参数化演示内容。
