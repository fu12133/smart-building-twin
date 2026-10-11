# GitHub Pages 发布记录

已发布并通过公网浏览器验收。

## 2026-10-12 建筑画质增强发布

- 已部署应用源码提交：`620ac962ad8cc6371bbab967635ab5396d5f3244`。
- 成功工作流：[38161433088](https://github.com/guangfubill-crypto/smart-building-twin/actions/runs/38161433088)。Linux + Chromium + SwiftShader 下 **10 / 10 passed (2.9 min)**，构建 3m35s，部署 11s。
- 公网 HTML 实际引用增强版产物 `index-Cbn2cQVL.js`，已核对，使用地址保持不变。
- 在真实 HTTPS 地址执行生产 harness：**1 / 1 passed (16.4 s)**。实际画布拖拽、楼层/设备、导航及视角复位通过；观察到的资源无 HTTP 错误，控制台无错误，开发诊断入口未暴露。
- 本地仓库子路径生产验收另通过 **1 / 1 (15.5 s)**。
- 线上截图 `artifacts/harness/production-online.png` 已检查；线上近景与旋转截图由 `PRODUCTION_URL=站点地址 node harness/capture-architecture.mjs` 再次捕获。

新模型包括四面玻璃幕墙、物理反射、办公室照明、屋顶机组、石材裙楼与入口、道路车辆、路灯和分层植被。静止时不重复 GPU 绘制，操作或巡航时刷新。它依然是参数化演示资产，未使用参考建筑的原始 BIM。

发布证据与截图的后续提交仅更新文档/图片，可使用 `[skip ci]`；线上应用仍是上面已通过全部检查的提交与产物。

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
